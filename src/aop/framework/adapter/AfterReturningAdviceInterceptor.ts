import { Reflectable } from '../../../deps/java/lang/Class.js';
import { MethodInterceptor, type MethodInvocation } from '../../../deps/aopalliance/index.js';
import { AfterAdvice } from '../../AfterAdvice.js';
import type { AfterReturningAdvice } from '../../AfterReturningAdvice.js';

/**
 * The interceptor for after-returning advice
 *
 * @author zqc
 * @date 2022/12/20
 */
@Reflectable('org.springframework.aop.framework.adapter.AfterReturningAdviceInterceptor', {
  implements: [MethodInterceptor, AfterAdvice],
})
export class AfterReturningAdviceInterceptor implements MethodInterceptor, AfterAdvice {
  private advice!: AfterReturningAdvice;

  constructor(advice?: AfterReturningAdvice) {
    if (advice !== undefined) {
      this.advice = advice;
    }
  }

  setAdvice(advice: AfterReturningAdvice): void {
    this.advice = advice;
  }

  invoke(mi: MethodInvocation): unknown {
    const retVal = mi.proceed();
    this.advice.afterReturning(retVal, mi.getMethod(), mi.getArguments(), mi.getThis());
    return retVal;
  }
}
