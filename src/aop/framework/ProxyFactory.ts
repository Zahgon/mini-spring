import { Reflectable } from '../../deps/java/lang/Class.js';
import { AdvisedSupport } from '../AdvisedSupport.js';
import type { AopProxy } from './AopProxy.js';
import { CglibAopProxy } from './CglibAopProxy.js';
import { JdkDynamicAopProxy } from './JdkDynamicAopProxy.js';

/**
 * @author zqc
 * @date 2022/12/16
 */
@Reflectable('org.springframework.aop.framework.ProxyFactory')
export class ProxyFactory extends AdvisedSupport {
  getProxy(): object {
    return this.createAopProxy().getProxy();
  }

  private createAopProxy(): AopProxy {
    if (this.isProxyTargetClass() || this.getTargetSource().getTargetClass().length === 0) {
      return new CglibAopProxy(this);
    }

    return new JdkDynamicAopProxy(this);
  }
}
