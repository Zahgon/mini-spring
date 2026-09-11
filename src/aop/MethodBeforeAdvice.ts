import { declareInterface, type JavaMethod } from '../deps/java/lang/Class.js';
import { BeforeAdvice } from './BeforeAdvice.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
export interface MethodBeforeAdvice extends BeforeAdvice {
  before(method: JavaMethod, args: unknown[], target: unknown): void;
}

export const MethodBeforeAdvice = declareInterface('org.springframework.aop.MethodBeforeAdvice', {
  implements: [BeforeAdvice],
});
