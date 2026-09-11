import {
  AfterReturningAdvice as AfterReturningAdviceType,
  Reflectable,
  System,
  type AfterReturningAdvice,
  type JavaMethod,
} from '../../src/index.js';

@Reflectable('org.springframework.test.common.WorldServiceAfterReturnAdvice', {
  implements: [AfterReturningAdviceType],
})
export class WorldServiceAfterReturnAdvice implements AfterReturningAdvice {
  afterReturning(
    _returnValue: unknown,
    _method: JavaMethod,
    _args: unknown[],
    _target: unknown,
  ): void {
    System.out.println('AfterAdvice: do something after the earth explodes');
  }
}
