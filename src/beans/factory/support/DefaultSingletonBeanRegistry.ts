import { Reflectable } from '../../../deps/java/lang/Class.js';
import { JavaHashMap } from '../../../deps/java/util/HashMap.js';
import { BeansException } from '../../BeansException.js';
import type { DisposableBean } from '../DisposableBean.js';
import type { ObjectFactory } from '../ObjectFactory.js';
import { SingletonBeanRegistry } from '../config/SingletonBeanRegistry.js';

/**
 * @author derekyi
 * @date 2020/11/22
 */
@Reflectable('org.springframework.beans.factory.support.DefaultSingletonBeanRegistry', {
  implements: [SingletonBeanRegistry],
})
export class DefaultSingletonBeanRegistry implements SingletonBeanRegistry {
  /** first-level cache */
  private readonly singletonObjects = new JavaHashMap<string, unknown>();

  /** second-level cache */
  private readonly earlySingletonObjects = new JavaHashMap<string, unknown>();

  /** third-level cache */
  private readonly singletonFactories = new JavaHashMap<string, ObjectFactory<unknown>>();

  private readonly disposableBeans = new JavaHashMap<string, DisposableBean>();

  getSingleton(beanName: string, allowEarlyReference = true): unknown {
    let singletonObject = this.singletonObjects.get(beanName);
    if (singletonObject === undefined) {
      singletonObject = this.earlySingletonObjects.get(beanName);
      // not every getSingleton() may consult the third-level cache!
      if (singletonObject === undefined && allowEarlyReference) {
        const singletonFactory = this.singletonFactories.get(beanName);
        if (singletonFactory !== undefined) {
          singletonObject = singletonFactory.getObject();
          // promote from the third-level cache into the second
          this.earlySingletonObjects.put(beanName, singletonObject);
          this.singletonFactories.remove(beanName);
        }
      }
    }
    return singletonObject === undefined ? null : singletonObject;
  }

  addSingleton(beanName: string, singletonObject: unknown): void {
    this.singletonObjects.put(beanName, singletonObject); // 1
    this.earlySingletonObjects.remove(beanName); // 2
    this.singletonFactories.remove(beanName); // 3
  }

  protected addSingletonFactory(beanName: string, singletonFactory: ObjectFactory<unknown>): void {
    this.singletonFactories.put(beanName, singletonFactory);
  }

  registerDisposableBean(beanName: string, bean: DisposableBean): void {
    this.disposableBeans.put(beanName, bean);
  }

  destroySingletons(): void {
    const beanNames = this.disposableBeans.keys();
    for (const beanName of beanNames) {
      const disposableBean = this.disposableBeans.remove(beanName)!;
      try {
        disposableBean.destroy();
      } catch (e) {
        throw new BeansException(
          `Destroy method on bean with name '${beanName}' threw an exception`,
          e,
        );
      }
    }
  }
}
