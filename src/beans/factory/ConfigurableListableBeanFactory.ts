import { declareInterface } from '../../deps/java/lang/Class.js';
import type { BeanDefinition } from './config/BeanDefinition.js';
import type { BeanPostProcessor } from './config/BeanPostProcessor.js';
import { AutowireCapableBeanFactory } from './config/AutowireCapableBeanFactory.js';
import { ConfigurableBeanFactory } from './config/ConfigurableBeanFactory.js';
import { ListableBeanFactory } from './ListableBeanFactory.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
export interface ConfigurableListableBeanFactory
  extends ListableBeanFactory,
    AutowireCapableBeanFactory,
    ConfigurableBeanFactory {
  /**
   * Looks a BeanDefinition up by name.
   *
   * @throws BeansException when there is no such BeanDefinition
   */
  getBeanDefinition(beanName: string): BeanDefinition;

  /** Instantiates every singleton eagerly. */
  preInstantiateSingletons(): void;

  addBeanPostProcessor(beanPostProcessor: BeanPostProcessor): void;
}

export const ConfigurableListableBeanFactory = declareInterface(
  'org.springframework.beans.factory.ConfigurableListableBeanFactory',
  { implements: [ListableBeanFactory, AutowireCapableBeanFactory, ConfigurableBeanFactory] },
);
