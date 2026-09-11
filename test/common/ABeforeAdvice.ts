import { MethodBeforeAdvice as MethodBeforeAdviceType, Reflectable, type JavaMethod, type MethodBeforeAdvice } from '../../src/index.js';

/**
 * @author derekyi
 * @date 2021/1/30
 */
@Reflectable('org.springframework.test.common.ABeforeAdvice', {
  implements: [MethodBeforeAdviceType],
})
export class ABeforeAdvice implements MethodBeforeAdvice {
  before(_method: JavaMethod, _args: unknown[], _target: unknown): void {}
}
