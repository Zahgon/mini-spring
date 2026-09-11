import { Reflectable } from '../../deps/java/lang/Class.js';
import type { Advice } from '../../deps/aopalliance/index.js';
import type { Pointcut } from '../Pointcut.js';
import { PointcutAdvisor } from '../PointcutAdvisor.js';
import { AspectJExpressionPointcut } from './AspectJExpressionPointcut.js';

/**
 * An advisor built from an AspectJ expression
 *
 * @author derekyi
 * @date 2020/12/6
 */
@Reflectable('org.springframework.aop.aspectj.AspectJExpressionPointcutAdvisor', {
  implements: [PointcutAdvisor],
})
export class AspectJExpressionPointcutAdvisor implements PointcutAdvisor {
  private pointcut: AspectJExpressionPointcut | null = null;

  private advice!: Advice;

  private expression!: string;

  setExpression(expression: string): void {
    this.expression = expression;
  }

  getPointcut(): Pointcut {
    if (this.pointcut === null) {
      this.pointcut = new AspectJExpressionPointcut(this.expression);
    }
    return this.pointcut;
  }

  getAdvice(): Advice {
    return this.advice;
  }

  setAdvice(advice: Advice): void {
    this.advice = advice;
  }
}
