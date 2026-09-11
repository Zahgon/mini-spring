import { declareInterface } from '../deps/java/lang/Class.js';
import type { Advice } from '../deps/aopalliance/index.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
export interface Advisor {
  getAdvice(): Advice;
}

export const Advisor = declareInterface('org.springframework.aop.Advisor');
