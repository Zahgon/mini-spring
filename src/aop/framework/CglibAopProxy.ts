import { getClass, Reflectable, type JavaClass, type JavaMethod } from '../../deps/java/lang/Class.js';
import type { AdvisedSupport } from '../AdvisedSupport.js';
import { AopProxy } from './AopProxy.js';
import { createProxy, targetClassMethods } from './proxySupport.js';
import { ReflectiveMethodInvocation } from './ReflectiveMethodInvocation.js';

/**
 * CGLIB dynamic proxy
 *
 * @author zqc
 * @date 2022/12/17
 */
@Reflectable('org.springframework.aop.framework.CglibAopProxy', { implements: [AopProxy] })
export class CglibAopProxy implements AopProxy {
  constructor(private readonly advised: AdvisedSupport) {}

  getProxy(): object {
    // build the dynamic proxy subclass
    const target = this.advised.getTargetSource().getTarget();
    const interceptor = new DynamicAdvisedInterceptor(this.advised);
    return createProxy(target, getClass(target), targetClassMethods(target), (method, args) =>
      interceptor.intercept(method, args),
    );
  }
}

/**
 * CGLIB's own MethodInterceptor is a different interface from the AOP
 * Alliance one that `advised` holds, so this class adapts between them.
 */
class DynamicAdvisedInterceptor {
  constructor(private readonly advised: AdvisedSupport) {}

  intercept(method: JavaMethod, args: unknown[]): unknown {
    // the target object
    const target = this.advised.getTargetSource().getTarget();
    const targetClass: JavaClass = getClass(target);
    let retVal: unknown = null;
    const chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
    const methodInvocation = new CglibMethodInvocation(
      target,
      target,
      method,
      args,
      targetClass,
      chain,
    );
    if (chain.length === 0) {
      // the proxied method
      retVal = method.invoke(target, args);
    } else {
      retVal = methodInvocation.proceed();
    }
    return retVal;
  }
}

class CglibMethodInvocation extends ReflectiveMethodInvocation {
  override proceed(): unknown {
    return super.proceed();
  }
}
