import { Reflectable, type JavaClass, type JavaMethod } from '../../deps/java/lang/Class.js';
import type { MethodInterceptor } from '../../deps/aopalliance/index.js';
import type { AdvisedSupport } from '../AdvisedSupport.js';
import type { Advisor } from '../Advisor.js';
import type { MethodMatcher } from '../MethodMatcher.js';
import { PointcutAdvisor } from '../PointcutAdvisor.js';
import { AdvisorChainFactory } from './AdvisorChainFactory.js';

/**
 * @author zqc
 * @date 2022/12/17
 */
@Reflectable('org.springframework.aop.framework.DefaultAdvisorChainFactory', {
  implements: [AdvisorChainFactory],
})
export class DefaultAdvisorChainFactory implements AdvisorChainFactory {
  getInterceptorsAndDynamicInterceptionAdvice(
    config: AdvisedSupport,
    method: JavaMethod,
    targetClass: JavaClass | null,
  ): unknown[] {
    const advisors: Advisor[] = [...config.getAdvisors()];
    const interceptorList: unknown[] = [];
    const actualClass = targetClass !== null ? targetClass : method.getDeclaringClass();
    for (const advisor of advisors) {
      if (PointcutAdvisor.isInstance(advisor)) {
        // add it conditionally
        const pointcutAdvisor = advisor as PointcutAdvisor;
        // check whether this Advisor applies to the current object
        if (pointcutAdvisor.getPointcut().getClassFilter().matches(actualClass)) {
          const mm: MethodMatcher = pointcutAdvisor.getPointcut().getMethodMatcher();
          // check whether the Advisor applies to the current method
          const match = mm.matches(method, actualClass);
          if (match) {
            const interceptor = advisor.getAdvice() as MethodInterceptor;
            interceptorList.push(interceptor);
          }
        }
      }
    }
    return interceptorList;
  }
}
