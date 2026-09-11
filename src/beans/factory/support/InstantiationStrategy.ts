import { declareInterface } from '../../../deps/java/lang/Class.js';
import type { BeanDefinition } from '../config/BeanDefinition.js';

/**
 * Bean instantiation strategy
 *
 * @author derekyi
 * @date 2020/11/23
 */
export interface InstantiationStrategy {
  instantiate(beanDefinition: BeanDefinition): object;
}

export const InstantiationStrategy = declareInterface(
  'org.springframework.beans.factory.support.InstantiationStrategy',
);
