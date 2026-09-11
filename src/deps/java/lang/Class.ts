/**
 * A reimplementation of the part of `java.lang.Class` and
 * `java.lang.reflect` that mini-spring depends on.
 *
 * Java keeps, at runtime, the four things TypeScript erases and this container
 * cannot work without:
 *
 *  1. a fully-qualified name that a string can be resolved back to
 *     (`Class.forName`, used for every `class="..."` attribute in the XML);
 *  2. the set of interfaces a class declares, including *marker* interfaces
 *     such as `Advice` and `Aware` that have no members at all, so structural
 *     typing cannot see them;
 *  3. the actual type arguments of a declared generic interface
 *     (`ApplicationListener<CustomEvent>`, `Converter<String, Integer>`);
 *  4. the declared type of every field, so an XML string can be converted to it.
 *
 * All four are therefore declared explicitly, by the {@link Reflectable}
 * decorator, and read back through the {@link JavaClass} facade.
 */

import { ClassNotFoundException } from './Exceptions.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Ctor<T = any> = abstract new (...args: any[]) => T;

/** Anything that can stand for a type: a JS class, or an already-built type. */
export type TypeRef = JavaClass | JavaParameterizedType | Ctor;

export interface AnnotationInstance<V extends object = object> {
  readonly annotationType: AnnotationType<V>;
  readonly values: V;
}

export interface AnnotationType<V extends object = object> {
  readonly name: string;
  /** Carries the attribute type; never present at run time. */
  readonly attributes?: V;
}

export interface ClassOptions {
  /** Directly declared interfaces, in declaration order, possibly parameterised. */
  readonly implements?: readonly TypeRef[];
  /** Declared fields and their declared types. */
  readonly fields?: Readonly<Record<string, TypeRef>>;
  /** Declared parameter types, for methods whose signature a pointcut may name. */
  readonly methods?: Readonly<Record<string, readonly TypeRef[]>>;
  /** Explicit superclass; only needed for types with no JS prototype link. */
  readonly extends?: JavaClass | null;
}

interface Metadata {
  name?: string;
  options?: ClassOptions;
  readonly annotations: AnnotationInstance[];
  readonly fieldAnnotations: Map<string, AnnotationInstance[]>;
  javaClass?: JavaClass;
}

const METADATA = new WeakMap<object, Metadata>();
const REGISTRY = new Map<string, JavaClass>();
const PROXY_CLASSES = new WeakMap<object, JavaClass>();

function metadataOf(ctor: object): Metadata {
  let meta = METADATA.get(ctor);
  if (meta === undefined) {
    meta = { annotations: [], fieldAnnotations: new Map() };
    METADATA.set(ctor, meta);
  }
  return meta;
}

/** `java.lang.reflect.ParameterizedType`, restricted to what is declared here. */
export class JavaParameterizedType {
  constructor(
    readonly rawType: JavaClass,
    private readonly typeArguments: readonly JavaClass[],
  ) {}

  getActualTypeArguments(): readonly JavaClass[] {
    return this.typeArguments;
  }

  getRawType(): JavaClass {
    return this.rawType;
  }

  getTypeName(): string {
    return `${this.rawType.getName()}<${this.typeArguments.map((t) => t.getTypeName()).join(', ')}>`;
  }
}

export class JavaField {
  constructor(
    readonly declaringClass: JavaClass,
    private readonly fieldName: string,
    private readonly fieldType: JavaClass,
    private readonly annotations: readonly AnnotationInstance[],
  ) {}

  getName(): string {
    return this.fieldName;
  }

  getType(): JavaClass {
    return this.fieldType;
  }

  getAnnotation<V extends object>(type: AnnotationType<V>): V | null {
    for (const annotation of this.annotations) {
      if (annotation.annotationType === type) {
        return annotation.values as V;
      }
    }
    return null;
  }
}

export class JavaMethod {
  constructor(
    readonly declaringClass: JavaClass,
    private readonly methodName: string,
    private readonly parameterTypes: readonly (JavaClass | null)[],
    private readonly fn: (...args: unknown[]) => unknown,
  ) {}

  getName(): string {
    return this.methodName;
  }

  getDeclaringClass(): JavaClass {
    return this.declaringClass;
  }

  /**
   * Declared parameter types. An entry is {@code null} where the signature was
   * not declared: TypeScript erases it, and only a pointcut that names an
   * argument type explicitly can tell the difference.
   */
  getParameterTypes(): readonly (JavaClass | null)[] {
    return this.parameterTypes;
  }

  getParameterCount(): number {
    return this.parameterTypes.length;
  }

  invoke(target: unknown, args: readonly unknown[] = []): unknown {
    return this.fn.apply(target, args as unknown[]);
  }

  /** `Method.hashCode()` — the key `AdvisedSupport.methodCache` is built on. */
  hashCode(): number {
    return (stringHashCode(this.declaringClass.getName()) ^ stringHashCode(this.methodName)) | 0;
  }

  toString(): string {
    return `${this.declaringClass.getName()}.${this.methodName}()`;
  }
}

export type ClassKind = 'class' | 'interface' | 'primitive';

export class JavaClass {
  private fields?: JavaField[];
  private methods?: Map<string, JavaMethod>;

  constructor(
    private readonly qualifiedName: string,
    readonly kind: ClassKind,
    readonly ctor: Ctor | null,
    private readonly options: ClassOptions,
    private readonly explicitSuperclass: JavaClass | null | undefined,
    /** The wrapper this primitive boxes to, for `BasicType.wrap`. */
    readonly wrapperType: JavaClass | null = null,
  ) {}

  getName(): string {
    return this.qualifiedName;
  }

  getTypeName(): string {
    return this.qualifiedName;
  }

  getSimpleName(): string {
    const dot = this.qualifiedName.lastIndexOf('.');
    return dot < 0 ? this.qualifiedName : this.qualifiedName.slice(dot + 1);
  }

  getSuperclass(): JavaClass | null {
    if (this.explicitSuperclass !== undefined) {
      return this.explicitSuperclass;
    }
    if (this.kind !== 'class' || this.ctor === null || this === OBJECT) {
      return null;
    }
    const parent: unknown = Object.getPrototypeOf(this.ctor);
    if (typeof parent === 'function' && METADATA.get(parent)?.name !== undefined) {
      return classOf(parent as Ctor);
    }
    return OBJECT;
  }

  /** `Class#getInterfaces()`: directly declared only, with type arguments erased. */
  getInterfaces(): JavaClass[] {
    return this.getGenericInterfaces().map((t) => (t instanceof JavaClass ? t : t.getRawType()));
  }

  getGenericInterfaces(): (JavaClass | JavaParameterizedType)[] {
    return (this.options.implements ?? []).map((ref) => resolveTypeRef(ref));
  }

  isInterface(): boolean {
    return this.kind === 'interface';
  }

  isPrimitive(): boolean {
    return this.kind === 'primitive';
  }

  isAssignableFrom(other: JavaClass): boolean {
    if (this === other) {
      return true;
    }
    if (this.kind === 'primitive' || other.kind === 'primitive') {
      return false;
    }
    for (const iface of other.getInterfaces()) {
      if (this.isAssignableFrom(iface)) {
        return true;
      }
    }
    const superclass = other.getSuperclass();
    return superclass !== null && this.isAssignableFrom(superclass);
  }

  isInstance(value: unknown): boolean {
    const type = classOfInstance(value);
    return type !== null && this.isAssignableFrom(type);
  }

  getDeclaredFields(): JavaField[] {
    if (this.fields === undefined) {
      const meta = this.ctor === null ? undefined : METADATA.get(this.ctor);
      // Own entries only: an object literal inherits `toString` and friends
      // from Object.prototype, and a field or method may well share the name.
      const declared = new Map<string, TypeRef>(Object.entries(this.options.fields ?? {}));
      const names = new Set<string>([
        ...declared.keys(),
        ...(meta?.fieldAnnotations.keys() ?? []),
      ]);
      this.fields = [...names].map((name) => {
        const ref = declared.get(name);
        return new JavaField(
          this,
          name,
          ref === undefined ? OBJECT : asClass(ref),
          meta?.fieldAnnotations.get(name) ?? [],
        );
      });
    }
    return this.fields;
  }

  getDeclaredField(name: string): JavaField | null {
    return this.getDeclaredFields().find((f) => f.getName() === name) ?? null;
  }

  /** All public methods, own and inherited — the JS prototype chain. */
  getMethods(): Map<string, JavaMethod> {
    if (this.methods === undefined) {
      const methods = new Map<string, JavaMethod>();
      for (const type of [this, ...ancestorsOf(this)]) {
        for (const [name, method] of type.getDeclaredMethods()) {
          if (!methods.has(name)) {
            methods.set(name, method);
          }
        }
      }
      this.methods = methods;
    }
    return this.methods;
  }

  getDeclaredMethods(): Map<string, JavaMethod> {
    const methods = new Map<string, JavaMethod>();
    const declaredSignatures = new Map<string, readonly TypeRef[]>(
      Object.entries(this.options.methods ?? {}),
    );
    const prototype: unknown = this.ctor === null ? null : this.ctor.prototype;
    if (prototype !== null && typeof prototype === 'object') {
      for (const name of Object.getOwnPropertyNames(prototype)) {
        if (name === 'constructor') {
          continue;
        }
        const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (descriptor === undefined || typeof descriptor.value !== 'function') {
          continue;
        }
        const fn = descriptor.value as (...args: unknown[]) => unknown;
        const declared = declaredSignatures.get(name);
        const parameterTypes =
          declared === undefined
            ? (new Array<null>(fn.length).fill(null) as (JavaClass | null)[])
            : declared.map((ref) => asClass(ref));
        methods.set(name, new JavaMethod(this, name, parameterTypes, fn));
      }
    }
    // An interface has no prototype of its own; its members are declared.
    for (const [name, signature] of declaredSignatures) {
      if (!methods.has(name)) {
        methods.set(
          name,
          new JavaMethod(
            this,
            name,
            signature.map((ref) => asClass(ref)),
            function abstractMethod(this: unknown, ...args: unknown[]): unknown {
              const target = this as Record<string, (...a: unknown[]) => unknown>;
              return target[name]!(...args);
            },
          ),
        );
      }
    }
    return methods;
  }

  /** `Class#getDeclaredMethod(name)` — throws when the method does not exist. */
  getDeclaredMethod(name: string): JavaMethod {
    const method = this.getDeclaredMethods().get(name);
    if (method === undefined) {
      throw new ClassNotFoundException(`${this.qualifiedName}.${name}()`);
    }
    return method;
  }

  getMethod(name: string): JavaMethod | null {
    return this.getMethods().get(name) ?? null;
  }

  getAnnotation<V extends object>(type: AnnotationType<V>): V | null {
    const annotations = this.ctor === null ? [] : (METADATA.get(this.ctor)?.annotations ?? []);
    for (const annotation of annotations) {
      if (annotation.annotationType === type) {
        return annotation.values as V;
      }
    }
    return null;
  }

  hashCode(): number {
    return stringHashCode(this.qualifiedName);
  }

  /** `Class#toString()` — reproduced because it is embedded in an error message. */
  toString(): string {
    if (this.kind === 'primitive') {
      return this.qualifiedName;
    }
    return `${this.kind === 'interface' ? 'interface' : 'class'} ${this.qualifiedName}`;
  }
}

const OBJECT = registerBuiltin('java.lang.Object', 'class', { extends: null });

function ancestorsOf(type: JavaClass): JavaClass[] {
  const seen = new Set<JavaClass>();
  const out: JavaClass[] = [];
  const visit = (current: JavaClass): void => {
    for (const iface of current.getInterfaces()) {
      if (!seen.has(iface)) {
        seen.add(iface);
        out.push(iface);
        visit(iface);
      }
    }
    const superclass = current.getSuperclass();
    if (superclass !== null && !seen.has(superclass)) {
      seen.add(superclass);
      out.push(superclass);
      visit(superclass);
    }
  };
  visit(type);
  return out;
}

/** `type` plus every supertype and superinterface, `type` first. */
export function typeAndAncestorsOf(type: JavaClass): JavaClass[] {
  return [type, ...ancestorsOf(type)];
}

export function resolveTypeRef(ref: TypeRef): JavaClass | JavaParameterizedType {
  if (ref instanceof JavaClass || ref instanceof JavaParameterizedType) {
    return ref;
  }
  return classOf(ref);
}

export function asClass(ref: TypeRef): JavaClass {
  const resolved = resolveTypeRef(ref);
  return resolved instanceof JavaClass ? resolved : resolved.getRawType();
}

/** `SomeClass.class` for a TypeScript class. */
export function classOf(ctor: Ctor): JavaClass {
  const meta = metadataOf(ctor);
  if (meta.javaClass === undefined) {
    const name = meta.name ?? (ctor as unknown as { name: string }).name;
    meta.javaClass = new JavaClass(
      name,
      'class',
      ctor,
      meta.options ?? {},
      meta.options?.extends,
    );
    if (meta.name !== undefined) {
      REGISTRY.set(meta.name, meta.javaClass);
    }
  }
  return meta.javaClass;
}

/** `value.getClass()`. */
export function classOfInstance(value: unknown): JavaClass | null {
  switch (typeof value) {
    case 'string':
      return STRING;
    case 'boolean':
      return BOOLEAN;
    case 'bigint':
      return LONG;
    case 'number':
      return Number.isInteger(value) ? INTEGER : DOUBLE;
    case 'object':
      break;
    default:
      return null;
  }
  if (value === null) {
    return null;
  }
  const proxied = PROXY_CLASSES.get(value as object);
  if (proxied !== undefined) {
    return proxied;
  }
  const ctor: unknown = (value as { constructor?: unknown }).constructor;
  return typeof ctor === 'function' ? classOf(ctor as Ctor) : OBJECT;
}

/** `value.getClass()`, for a value known not to be null. */
export function getClass(value: NonNullable<unknown>): JavaClass {
  return classOfInstance(value) ?? OBJECT;
}

/**
 * Records that a proxy stands for {@code type}. A CGLIB proxy is a subclass of
 * its target and a JDK proxy implements its target's interfaces; either way
 * `getClass()` on the proxy must not report the plain `Object` a bare JS
 * `Proxy` would.
 */
export function registerProxyClass(proxy: object, type: JavaClass): void {
  PROXY_CLASSES.set(proxy, type);
}

/** `Class.forName(name)`. */
export function forName(name: string): JavaClass {
  const found = REGISTRY.get(name);
  if (found === undefined) {
    throw new ClassNotFoundException(name);
  }
  return found;
}

export function findClass(name: string): JavaClass | null {
  return REGISTRY.get(name) ?? null;
}

/** Every registered class, in registration order — the "classpath". */
export function registeredClasses(): JavaClass[] {
  return [...REGISTRY.values()];
}

/**
 * Declares the runtime type information TypeScript erases.
 *
 * ```ts
 * @Reflectable('org.springframework.test.bean.Car', { fields: { price: Types.int } })
 * export class Car {}
 * ```
 */
export function Reflectable(name: string, options: ClassOptions = {}) {
  return function decorate<T extends Ctor>(ctor: T): T {
    const meta = metadataOf(ctor);
    meta.name = name;
    meta.options = options;
    classOf(ctor);
    return ctor;
  };
}

/** Declares a Java interface: a runtime type with no JS representation. */
export function declareInterface(
  name: string,
  options: ClassOptions = {},
): JavaClass & { of(...typeArguments: TypeRef[]): JavaParameterizedType } {
  const type = new JavaClass(name, 'interface', null, options, null);
  REGISTRY.set(name, type);
  return Object.assign(type, {
    of(...typeArguments: TypeRef[]): JavaParameterizedType {
      return new JavaParameterizedType(type, typeArguments.map((ref) => asClass(ref)));
    },
  });
}

function registerBuiltin(
  name: string,
  kind: ClassKind,
  options: ClassOptions & { extends?: JavaClass | null } = {},
  wrapperType: JavaClass | null = null,
): JavaClass {
  const type = new JavaClass(name, kind, null, options, options.extends, wrapperType);
  REGISTRY.set(name, type);
  return type;
}

/** `String.hashCode()` — the basis of every hash-ordered collection here. */
export function stringHashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return hash;
}

const NUMBER = registerBuiltin('java.lang.Number', 'class', { extends: OBJECT });
const INTEGER = registerBuiltin('java.lang.Integer', 'class', { extends: NUMBER });
const LONG = registerBuiltin('java.lang.Long', 'class', { extends: NUMBER });
const DOUBLE = registerBuiltin('java.lang.Double', 'class', { extends: NUMBER });
const STRING = registerBuiltin('java.lang.String', 'class', { extends: OBJECT });
const BOOLEAN = registerBuiltin('java.lang.Boolean', 'class', { extends: OBJECT });

/**
 * The built-in types the container names directly. Primitives and their
 * wrappers are distinct, exactly as in Java, because `BasicType.wrap` and the
 * converter lookup both depend on the difference.
 */
export const Types = {
  Object: OBJECT,
  Number: NUMBER,
  Integer: INTEGER,
  Long: LONG,
  Double: DOUBLE,
  String: STRING,
  Boolean: BOOLEAN,
  int: registerBuiltin('int', 'primitive', {}, INTEGER),
  long: registerBuiltin('long', 'primitive', {}, LONG),
  double: registerBuiltin('double', 'primitive', {}, DOUBLE),
  boolean: registerBuiltin('boolean', 'primitive', {}, BOOLEAN),
} as const;

/** Defines an annotation type and the decorator that applies it. */
export function defineAnnotation<V extends object>(
  name: string,
): AnnotationType<V> & {
  (values: V): ClassDecorator & PropertyDecorator;
} {
  const annotationType = ((values: V): ClassDecorator & PropertyDecorator =>
    ((target: object, propertyKey?: string | symbol): void => {
      const instance: AnnotationInstance<V> = { annotationType, values };
      if (propertyKey === undefined) {
        metadataOf(target).annotations.push(instance as AnnotationInstance);
      } else {
        const meta = metadataOf((target as { constructor: object }).constructor);
        const key = String(propertyKey);
        const existing = meta.fieldAnnotations.get(key) ?? [];
        existing.push(instance as AnnotationInstance);
        meta.fieldAnnotations.set(key, existing);
      }
    }) as ClassDecorator & PropertyDecorator) as AnnotationType<V> & {
    (values: V): ClassDecorator & PropertyDecorator;
  };
  // A function's `name` is non-writable but configurable, so it has to be
  // redefined rather than assigned.
  Object.defineProperty(annotationType, 'name', { value: name, configurable: true });
  return annotationType;
}
