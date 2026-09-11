import { Reflectable, type JavaClass, type JavaMethod } from '../../deps/java/lang/Class.js';
import { MethodInvocation, type MethodInterceptor } from '../../deps/aopalliance/index.js';

/**
 * @author zqc
 * @date 2022/12/16
 */
@Reflectable('org.springframework.aop.framework.ReflectiveMethodInvocation', {
  implements: [MethodInvocation],
})
export class ReflectiveMethodInvocation implements MethodInvocation {
  protected readonly proxy: object;

  protected readonly target: unknown;

  protected readonly method: JavaMethod;

  protected readonly arguments: unknown[];

  protected readonly targetClass: JavaClass | null;

  protected readonly interceptorsAndDynamicMethodMatchers: unknown[];

  private currentInterceptorIndex = -1;

  constructor(
    proxy: object,
    target: unknown,
    method: JavaMethod,
    args: unknown[],
    targetClass: JavaClass | null,
    chain: unknown[],
  ) {
    this.proxy = proxy;
    this.target = target;
    this.method = method;
    this.arguments = args;
    this.targetClass = targetClass;
    this.interceptorsAndDynamicMethodMatchers = chain;
  }

  proceed(): unknown {
    // currentInterceptorIndex starts at -1 and is incremented on every call
    if (this.currentInterceptorIndex === this.interceptorsAndDynamicMethodMatchers.length - 1) {
      // once the call count equals the number of interceptors, invoke the
      // target method itself
      return this.method.invoke(this.target, this.arguments);
    }

    const interceptorOrInterceptionAdvice =
      this.interceptorsAndDynamicMethodMatchers[++this.currentInterceptorIndex];
    // an ordinary interceptor: call its invoke method directly
    return (interceptorOrInterceptionAdvice as MethodInterceptor).invoke(this);
  }

  getMethod(): JavaMethod {
    return this.method;
  }

  getArguments(): unknown[] {
    return this.arguments;
  }

  getThis(): unknown {
    return this.target;
  }

  getStaticPart(): unknown {
    return this.method;
  }
}
