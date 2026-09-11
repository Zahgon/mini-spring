import { declareInterface } from '../../deps/java/lang/Class.js';
import { Aware } from './Aware.js';
import type { BeanFactory } from './BeanFactory.js';

/**
 * Implementing it makes a bean aware of the BeanFactory that owns it.
 *
 * @author derekyi
 * @date 2020/12/1
 */
export interface BeanFactoryAware extends Aware {
  setBeanFactory(beanFactory: BeanFactory): void;
}

export const BeanFactoryAware = declareInterface(
  'org.springframework.beans.factory.BeanFactoryAware',
  { implements: [Aware] },
);
