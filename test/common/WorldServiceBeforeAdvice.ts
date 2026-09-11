import {
  MethodBeforeAdvice as MethodBeforeAdviceType,
  Reflectable,
  System,
  type JavaMethod,
  type MethodBeforeAdvice,
} from '../../src/index.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
@Reflectable('org.springframework.test.common.WorldServiceBeforeAdvice', {
  implements: [MethodBeforeAdviceType],
})
export class WorldServiceBeforeAdvice implements MethodBeforeAdvice {
  before(_method: JavaMethod, _args: unknown[], _target: unknown): void {
    System.out.println('BeforeAdvice: do something before the earth explodes');
  }
}
