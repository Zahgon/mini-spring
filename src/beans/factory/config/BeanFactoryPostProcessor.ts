import { declareInterface } from '../../../deps/java/lang/Class.js';
import type { ConfigurableListableBeanFactory } from '../ConfigurableListableBeanFactory.js';

/**
 * Allows the property values of a BeanDefinition to be modified
 *
 * @author derekyi
 * @date 2020/11/28
 */
export interface BeanFactoryPostProcessor {
  /**
   * Runs once every BeanDefinition has been loaded but before any bean has
   * been instantiated.
   */
  postProcessBeanFactory(beanFactory: ConfigurableListableBeanFactory): void;
}

export const BeanFactoryPostProcessor = declareInterface(
  'org.springframework.beans.factory.config.BeanFactoryPostProcessor',
);
