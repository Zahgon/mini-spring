import { Reflectable, registerProxyClass } from '../../../deps/java/lang/Class.js';
import type { BeanDefinition } from '../config/BeanDefinition.js';
import { InstantiationStrategy } from './InstantiationStrategy.js';

/**
 * @author derekyi
 * @date 2020/11/23
 */
@Reflectable('org.springframework.beans.factory.support.CglibSubclassingInstantiationStrategy', {
  implements: [InstantiationStrategy],
})
export class CglibSubclassingInstantiationStrategy implements InstantiationStrategy {
  /**
   * Generates a subclass dynamically.
   *
   * CGLIB's `Enhancer` builds a subclass whose every method calls
   * `proxy.invokeSuper(...)`, i.e. an instance that behaves exactly like the
   * superclass. A JavaScript subclass of the bean class is the same thing.
   */
  instantiate(beanDefinition: BeanDefinition): object {
    const beanClass = beanDefinition.getBeanClass();
    const constructor = beanClass.ctor;
    if (constructor === null) {
      throw new TypeError(`${beanClass.getName()} has no constructor`);
    }
    const enhanced = class extends (constructor as new () => object) {};
    Object.defineProperty(enhanced, 'name', {
      value: `${beanClass.getSimpleName()}$$EnhancerByCGLIB`,
    });
    const instance = new enhanced();
    registerProxyClass(instance, beanClass);
    return instance;
  }
}
