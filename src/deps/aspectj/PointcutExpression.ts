/**
 * The `org.aspectj.weaver.tools` surface mini-spring uses, restricted — as the
 * original restricts it — to the `execution()` primitive.
 *
 * There is no TypeScript package with AspectJ's matching semantics, and those
 * semantics are contract: they decide which beans get proxied and which methods
 * get advised. So the grammar is parsed and matched here:
 *
 *     execution(<modifiers>* <return-type> [<declaring-type>.]<name>(<args>))
 *
 * with `*` matching any run of characters inside one name segment, `..`
 * matching across segments (and, in the argument list, any number of
 * arguments), and a trailing `+` widening a type pattern to its subtypes.
 */

import { IllegalArgumentException } from '../java/lang/Exceptions.js';
import { type JavaClass, type JavaMethod, typeAndAncestorsOf } from '../java/lang/Class.js';

export enum PointcutPrimitive {
  EXECUTION = 'execution',
}

export class UnsupportedPointcutPrimitiveException extends IllegalArgumentException {}

export class ShadowMatch {
  constructor(private readonly matched: boolean) {}

  alwaysMatches(): boolean {
    return this.matched;
  }

  neverMatches(): boolean {
    return !this.matched;
  }
}

/** A single `*`/`..`/`+` type or name pattern. */
class NamePattern {
  private readonly regex: RegExp;
  readonly includeSubtypes: boolean;
  private readonly matchesAnything: boolean;
  private readonly wildcarded: boolean;

  constructor(pattern: string) {
    this.includeSubtypes = pattern.endsWith('+');
    const bare = this.includeSubtypes ? pattern.slice(0, -1) : pattern;
    this.matchesAnything = bare === '*' || bare === '..';
    this.wildcarded = bare.includes('*') || bare.includes('..');
    const source = bare
      .split('..')
      .map((segment) =>
        segment
          .split('*')
          .map((literal) => literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('[^.]*'),
      )
      .join('.*');
    this.regex = new RegExp(`^${source}$`);
  }

  matches(name: string): boolean {
    return this.matchesAnything || this.regex.test(name);
  }

  isWildcard(): boolean {
    return this.matchesAnything;
  }

  containsWildcard(): boolean {
    return this.wildcarded;
  }
}

class TypePattern {
  private readonly pattern: NamePattern;

  constructor(text: string) {
    this.pattern = new NamePattern(text);
  }

  matches(type: JavaClass): boolean {
    if (this.matchesName(type)) {
      return true;
    }
    return (
      this.pattern.includeSubtypes &&
      typeAndAncestorsOf(type).some((ancestor) => this.matchesName(ancestor))
    );
  }

  /**
   * A pattern with no package part also resolves against `java.lang`, which is
   * the one import AspectJ always has: `setName(String)` matches
   * `setName(java.lang.String)`. No other unqualified name is resolved — there
   * is no import list here to resolve it against.
   */
  private matchesName(type: JavaClass): boolean {
    if (this.pattern.matches(type.getName())) {
      return true;
    }
    return type.getName().startsWith('java.lang.') && this.pattern.matches(type.getSimpleName());
  }

  isWildcard(): boolean {
    return this.pattern.isWildcard();
  }

  containsWildcard(): boolean {
    return this.pattern.containsWildcard();
  }
}

class ArgumentsPattern {
  /** `null` for `..`, which accepts any number of arguments. */
  private readonly types: (TypePattern | null)[] | null;

  constructor(text: string) {
    const trimmed = text.trim();
    if (trimmed === '..') {
      this.types = null;
    } else if (trimmed === '') {
      this.types = [];
    } else if (trimmed.includes('..')) {
      // A partially open argument list is not used anywhere in this repository.
      throw new UnsupportedPointcutPrimitiveException(`Unsupported argument pattern: ${text}`);
    } else {
      this.types = trimmed
        .split(',')
        .map((part) => part.trim())
        .map((part) => (part === '*' ? null : new TypePattern(part)));
    }
  }

  matches(parameterTypes: readonly (JavaClass | null)[]): boolean {
    if (this.types === null) {
      return true;
    }
    if (this.types.length !== parameterTypes.length) {
      return false;
    }
    return this.types.every((expected, index) => {
      if (expected === null) {
        return true;
      }
      const actual = parameterTypes[index];
      // The declared parameter type was erased and never re-declared, so a
      // pattern that names a type cannot be decided.
      return actual !== null && actual !== undefined && expected.matches(actual);
    });
  }
}

const MODIFIERS = new Set([
  'public',
  'protected',
  'private',
  'static',
  'final',
  'synchronized',
  'native',
  'abstract',
  'strictfp',
  '!static',
  '!final',
]);

export class PointcutExpression {
  private readonly returnType: TypePattern;
  private readonly declaringType: TypePattern;
  private readonly methodName: NamePattern;
  private readonly parameters: ArgumentsPattern;

  constructor(
    private readonly expression: string,
    supportedPrimitives: ReadonlySet<PointcutPrimitive>,
  ) {
    const trimmed = expression.trim();
    const open = trimmed.indexOf('(');
    const primitive = open < 0 ? trimmed : trimmed.slice(0, open).trim();
    if (primitive !== PointcutPrimitive.EXECUTION) {
      throw new UnsupportedPointcutPrimitiveException(
        `Pointcut primitive is not supported by this parser: ${primitive}`,
      );
    }
    if (!supportedPrimitives.has(PointcutPrimitive.EXECUTION)) {
      throw new UnsupportedPointcutPrimitiveException(
        `Pointcut primitive is not supported by this parser: ${primitive}`,
      );
    }
    if (!trimmed.endsWith(')')) {
      throw new IllegalArgumentException(`Pointcut is not well-formed: ${expression}`);
    }

    const signature = trimmed.slice(open + 1, -1).trim();
    const argumentsOpen = signature.indexOf('(');
    const argumentsClose = signature.lastIndexOf(')');
    if (argumentsOpen < 0 || argumentsClose < argumentsOpen) {
      throw new IllegalArgumentException(`Pointcut is not well-formed: ${expression}`);
    }
    this.parameters = new ArgumentsPattern(signature.slice(argumentsOpen + 1, argumentsClose));

    const head = signature.slice(0, argumentsOpen).trim().split(/\s+/);
    while (head.length > 2 && MODIFIERS.has(head[0]!)) {
      head.shift();
    }
    if (head.length < 2) {
      throw new IllegalArgumentException(`Pointcut is not well-formed: ${expression}`);
    }
    const qualifiedName = head[head.length - 1]!;
    this.returnType = new TypePattern(head[head.length - 2]!);

    const lastDot = qualifiedName.lastIndexOf('.');
    this.declaringType = new TypePattern(lastDot < 0 ? '*' : qualifiedName.slice(0, lastDot));
    this.methodName = new NamePattern(lastDot < 0 ? qualifiedName : qualifiedName.slice(lastDot + 1));
  }

  getPointcutExpression(): string {
    return this.expression;
  }

  /**
   * `PointcutExpression#couldMatchJoinPointsInType`.
   *
   * This is AspectJ's conservative fast match, and it is deliberately weaker
   * than `matchesMethodExecution`: it looks only at the declaring-type pattern,
   * ignoring the method name and the argument list, and a type pattern that
   * contains a wildcard is treated as "could match anything". Both quirks are
   * observable — `execution(* pkg.WorldService.explode(*))` reports every
   * `WorldService` implementation here even though it advises no method at all.
   */
  couldMatchJoinPointsInType(type: JavaClass): boolean {
    if (this.declaringType.containsWildcard()) {
      return true;
    }
    return typeAndAncestorsOf(type).some((candidate) => this.declaringType.matches(candidate));
  }

  /** `PointcutExpression#matchesMethodExecution`. */
  matchesMethodExecution(method: JavaMethod): ShadowMatch {
    if (!this.matchesSignature(method)) {
      return new ShadowMatch(false);
    }
    return new ShadowMatch(
      typeAndAncestorsOf(method.getDeclaringClass()).some((candidate) =>
        this.declaringType.matches(candidate),
      ),
    );
  }

  private matchesSignature(method: JavaMethod): boolean {
    return (
      this.methodName.matches(method.getName()) &&
      this.parameters.matches(method.getParameterTypes()) &&
      // Return types are erased; only a wildcard return pattern can be decided.
      this.returnType.isWildcard()
    );
  }
}

export class PointcutParser {
  private constructor(private readonly supportedPrimitives: ReadonlySet<PointcutPrimitive>) {}

  static getPointcutParserSupportingSpecifiedPrimitives(
    supportedPrimitives: ReadonlySet<PointcutPrimitive>,
  ): PointcutParser {
    return new PointcutParser(supportedPrimitives);
  }

  parsePointcutExpression(expression: string): PointcutExpression {
    return new PointcutExpression(expression, this.supportedPrimitives);
  }
}
