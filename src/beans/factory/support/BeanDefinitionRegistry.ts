import { declareInterface } from '../../../deps/java/lang/Class.js';
import type { BeanDefinition } from '../config/BeanDefinition.js';

/**
 * BeanDefinition registry interface
 *
 * @author derekyi
 * @date 2020/11/22
 */
export interface BeanDefinitionRegistry {
  /** Registers a BeanDefinition. */
  registerBeanDefinition(beanName: string, beanDefinition: BeanDefinition): void;

  /**
   * Looks a BeanDefinition up by name.
   *
   * @throws BeansException when there is no such BeanDefinition
   */
  getBeanDefinition(beanName: string): BeanDefinition;

  /** Whether a BeanDefinition with this name is registered. */
  containsBeanDefinition(beanName: string): boolean;

  /** The names of every defined bean. */
  getBeanDefinitionNames(): string[];
}

export const BeanDefinitionRegistry = declareInterface(
  'org.springframework.beans.factory.support.BeanDefinitionRegistry',
);
