import { declareInterface } from '../../deps/java/lang/Class.js';

/**
 * AOP proxy abstraction
 *
 * @author derekyi
 * @date 2020/12/5
 */
export interface AopProxy {
  getProxy(): object;
}

export const AopProxy = declareInterface('org.springframework.aop.framework.AopProxy');
