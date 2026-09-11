import { declareInterface } from '../deps/java/lang/Class.js';
import { Advice } from '../deps/aopalliance/index.js';

/**
 * Advice that runs after the join point
 *
 * @author zqc
 * @date 2022/12/16
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AfterAdvice extends Advice {}

export const AfterAdvice = declareInterface('org.springframework.aop.AfterAdvice', {
  implements: [Advice],
});
