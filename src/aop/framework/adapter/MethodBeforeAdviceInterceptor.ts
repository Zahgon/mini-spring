import { Reflectable } from '../../../deps/java/lang/Class.js';
import { MethodInterceptor, type MethodInvocation } from '../../../deps/aopalliance/index.js';
import { BeforeAdvice } from '../../BeforeAdvice.js';
import type { MethodBeforeAdvice } from '../../MethodBeforeAdvice.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
@Reflectable('org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor', {
  implements: [MethodInterceptor, BeforeAdvice],
})
export class MethodBeforeAdviceInterceptor implements MethodInterceptor, BeforeAdvice {
  private advice!: MethodBeforeAdvice;

  constructor(advice?: MethodBeforeAdvice) {
    if (advice !== undefined) {
      this.advice = advice;
    }
  }

  setAdvice(advice: MethodBeforeAdvice): void {
    this.advice = advice;
  }

  invoke(mi: MethodInvocation): unknown {
    // run the before advice ahead of the proxied method
    this.advice.before(mi.getMethod(), mi.getArguments(), mi.getThis());
    return mi.proceed();
  }
}
