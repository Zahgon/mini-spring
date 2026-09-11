import { declareInterface } from '../../../deps/java/lang/Class.js';

/**
 * Extension point for modifying a bean once it has been instantiated
 *
 * @author derekyi
 * @date 2020/11/28
 */
export interface BeanPostProcessor {
  /** Runs before the bean's initialisation method. */
  postProcessBeforeInitialization(bean: unknown, beanName: string): unknown;

  /** Runs after the bean's initialisation method. */
  postProcessAfterInitialization(bean: unknown, beanName: string): unknown;
}

export const BeanPostProcessor = declareInterface(
  'org.springframework.beans.factory.config.BeanPostProcessor',
);
