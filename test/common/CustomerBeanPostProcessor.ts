import {
  BeanPostProcessor as BeanPostProcessorType,
  Reflectable,
  System,
  type BeanPostProcessor,
} from '../../src/index.js';
import type { Car } from '../bean/Car.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
@Reflectable('org.springframework.test.common.CustomerBeanPostProcessor', {
  implements: [BeanPostProcessorType],
})
export class CustomerBeanPostProcessor implements BeanPostProcessor {
  postProcessBeforeInitialization(bean: unknown, beanName: string): unknown {
    System.out.println(
      `CustomerBeanPostProcessor#postProcessBeforeInitialization, beanName: ${beanName}`,
    );
    // swap in a Lamborghini
    if (beanName === 'car') {
      (bean as Car).setBrand('lamborghini');
    }
    return bean;
  }

  postProcessAfterInitialization(bean: unknown, beanName: string): unknown {
    System.out.println(
      `CustomerBeanPostProcessor#postProcessAfterInitialization, beanName: ${beanName}`,
    );
    return bean;
  }
}
