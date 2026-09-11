import { Reflectable } from '../../../deps/java/lang/Class.js';
import { BeansException } from '../../BeansException.js';
import type { BeanDefinition } from '../config/BeanDefinition.js';
import { InstantiationStrategy } from './InstantiationStrategy.js';

/**
 * @author derekyi
 * @date 2020/11/23
 */
@Reflectable('org.springframework.beans.factory.support.SimpleInstantiationStrategy', {
  implements: [InstantiationStrategy],
})
export class SimpleInstantiationStrategy implements InstantiationStrategy {
  /**
   * The simple bean instantiation strategy: the class's no-argument
   * constructor.
   */
  instantiate(beanDefinition: BeanDefinition): object {
    const beanClass = beanDefinition.getBeanClass();
    try {
      const constructor = beanClass.ctor;
      if (constructor === null) {
        throw new TypeError(`${beanClass.getName()} has no constructor`);
      }
      return new (constructor as new () => object)();
    } catch (e) {
      throw new BeansException(`Failed to instantiate [${beanClass.getName()}]`, e);
    }
  }
}
