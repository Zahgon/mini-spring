import { declareInterface, type JavaClass } from '../../../deps/java/lang/Class.js';
import type { PropertyValues } from '../../PropertyValues.js';
import { BeanPostProcessor } from './BeanPostProcessor.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
export interface InstantiationAwareBeanPostProcessor extends BeanPostProcessor {
  /** Runs before the bean is instantiated. */
  postProcessBeforeInstantiation(beanClass: JavaClass, beanName: string): unknown;

  /** Runs after instantiation and before the properties are set. */
  postProcessAfterInstantiation(bean: unknown, beanName: string): boolean;

  /** Runs after instantiation and before the properties are set. */
  postProcessPropertyValues(
    pvs: PropertyValues,
    bean: unknown,
    beanName: string,
  ): PropertyValues | null;

  /** Exposes the bean early. */
  getEarlyBeanReference?(bean: unknown, beanName: string): unknown;
}

export const InstantiationAwareBeanPostProcessor = declareInterface(
  'org.springframework.beans.factory.config.InstantiationAwareBeanPostProcessor',
  { implements: [BeanPostProcessor] },
);

/**
 * The default body of `getEarlyBeanReference`, which the interface supplies in
 * Java as a `default` method.
 */
export function getEarlyBeanReference(
  processor: InstantiationAwareBeanPostProcessor,
  bean: unknown,
  beanName: string,
): unknown {
  return processor.getEarlyBeanReference === undefined
    ? bean
    : processor.getEarlyBeanReference(bean, beanName);
}
