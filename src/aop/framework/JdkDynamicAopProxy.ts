import { getClass, Reflectable, type JavaMethod } from '../../deps/java/lang/Class.js';
import type { MethodInvocation } from '../../deps/aopalliance/index.js';
import type { AdvisedSupport } from '../AdvisedSupport.js';
import { AopProxy } from './AopProxy.js';
import { createProxy, interfaceMethods } from './proxySupport.js';
import { ReflectiveMethodInvocation } from './ReflectiveMethodInvocation.js';

/**
 * JDK dynamic proxy
 *
 * @author zqc
 * @date 2022/12/19
 */
@Reflectable('org.springframework.aop.framework.JdkDynamicAopProxy', { implements: [AopProxy] })
export class JdkDynamicAopProxy implements AopProxy {
  constructor(private readonly advised: AdvisedSupport) {}

  /**
   * Returns the proxy object.
   */
  getProxy(): object {
    const target = this.advised.getTargetSource().getTarget();
    const interfaces = this.advised.getTargetSource().getTargetClass();
    return createProxy(
      target,
      getClass(target),
      interfaceMethods(interfaces),
      (method, args) => this.invoke(method, args),
    );
  }

  invoke(method: JavaMethod, args: unknown[]): unknown {
    // the target object
    const target = this.advised.getTargetSource().getTarget();
    const targetClass = getClass(target);
    let retVal: unknown = null;
    // the interceptor chain
    const chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
    if (chain.length === 0) {
      return method.invoke(target, args);
    } else {
      // wrap the interceptors in a ReflectiveMethodInvocation
      const invocation: MethodInvocation = new ReflectiveMethodInvocation(
        target,
        target,
        method,
        args,
        targetClass,
        chain,
      );
      // proceed to the join point through the interceptor chain
      retVal = invocation.proceed();
    }
    return retVal;
  }
}
