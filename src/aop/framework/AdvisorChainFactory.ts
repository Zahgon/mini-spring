import { declareInterface, type JavaClass, type JavaMethod } from '../../deps/java/lang/Class.js';
import type { AdvisedSupport } from '../AdvisedSupport.js';

/**
 * @author zqc
 * @date 2022/12/16
 */
export interface AdvisorChainFactory {
  getInterceptorsAndDynamicInterceptionAdvice(
    config: AdvisedSupport,
    method: JavaMethod,
    targetClass: JavaClass | null,
  ): unknown[];
}

export const AdvisorChainFactory = declareInterface(
  'org.springframework.aop.framework.AdvisorChainFactory',
);
