import {
  MethodInterceptor as MethodInterceptorType,
  Reflectable,
  System,
  type MethodInterceptor,
  type MethodInvocation,
} from '../../src/index.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
@Reflectable('org.springframework.test.common.WorldServiceInterceptor', {
  implements: [MethodInterceptorType],
})
export class WorldServiceInterceptor implements MethodInterceptor {
  invoke(invocation: MethodInvocation): unknown {
    System.out.println('Do something before the earth explodes');
    const result = invocation.proceed();
    System.out.println('Do something after the earth explodes');
    return result;
  }
}
