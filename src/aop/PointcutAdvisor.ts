import { declareInterface } from '../deps/java/lang/Class.js';
import { Advisor } from './Advisor.js';
import type { Pointcut } from './Pointcut.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
export interface PointcutAdvisor extends Advisor {
  getPointcut(): Pointcut;
}

export const PointcutAdvisor = declareInterface('org.springframework.aop.PointcutAdvisor', {
  implements: [Advisor],
});
