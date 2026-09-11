import { declareInterface } from '../deps/java/lang/Class.js';
import { Advice } from '../deps/aopalliance/index.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BeforeAdvice extends Advice {}

export const BeforeAdvice = declareInterface('org.springframework.aop.BeforeAdvice', {
  implements: [Advice],
});
