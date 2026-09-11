import { declareInterface } from '../../../deps/java/lang/Class.js';
import { BeanFactory } from '../BeanFactory.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
export interface AutowireCapableBeanFactory extends BeanFactory {
  /** Runs `postProcessBeforeInitialization` on every BeanPostProcessor. */
  applyBeanPostProcessorsBeforeInitialization(existingBean: unknown, beanName: string): unknown;

  /** Runs `postProcessAfterInitialization` on every BeanPostProcessor. */
  applyBeanPostProcessorsAfterInitialization(existingBean: unknown, beanName: string): unknown;
}

export const AutowireCapableBeanFactory = declareInterface(
  'org.springframework.beans.factory.config.AutowireCapableBeanFactory',
  { implements: [BeanFactory] },
);
