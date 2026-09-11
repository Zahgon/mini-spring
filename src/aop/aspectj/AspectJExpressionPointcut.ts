import { JavaClass, Reflectable, type JavaMethod } from '../../deps/java/lang/Class.js';
import {
  PointcutExpression,
  PointcutParser,
  PointcutPrimitive,
} from '../../deps/aspectj/PointcutExpression.js';
import { ClassFilter } from '../ClassFilter.js';
import { MethodMatcher } from '../MethodMatcher.js';
import { Pointcut } from '../Pointcut.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
@Reflectable('org.springframework.aop.aspectj.AspectJExpressionPointcut', {
  implements: [Pointcut, ClassFilter, MethodMatcher],
})
export class AspectJExpressionPointcut implements Pointcut, ClassFilter, MethodMatcher {
  private static readonly SUPPORTED_PRIMITIVES = new Set<PointcutPrimitive>([
    PointcutPrimitive.EXECUTION,
  ]);

  private readonly pointcutExpression: PointcutExpression;

  constructor(expression: string) {
    const pointcutParser = PointcutParser.getPointcutParserSupportingSpecifiedPrimitives(
      AspectJExpressionPointcut.SUPPORTED_PRIMITIVES,
    );
    this.pointcutExpression = pointcutParser.parsePointcutExpression(expression);
  }

  matches(clazz: JavaClass): boolean;
  matches(method: JavaMethod, targetClass: JavaClass): boolean;
  matches(target: JavaClass | JavaMethod, _targetClass?: JavaClass): boolean {
    if (target instanceof JavaClass) {
      return this.pointcutExpression.couldMatchJoinPointsInType(target);
    }
    return this.pointcutExpression.matchesMethodExecution(target).alwaysMatches();
  }

  getClassFilter(): ClassFilter {
    return this;
  }

  getMethodMatcher(): MethodMatcher {
    return this;
  }
}
