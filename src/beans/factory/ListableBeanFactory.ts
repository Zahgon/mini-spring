import { declareInterface, type TypeRef } from '../../deps/java/lang/Class.js';
import type { JavaHashMap } from '../../deps/java/util/HashMap.js';
import { BeanFactory } from './BeanFactory.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
export interface ListableBeanFactory extends BeanFactory {
  /** Every instance of the given type. */
  getBeansOfType<T>(type: TypeRef): JavaHashMap<string, T>;

  /** The names of every defined bean. */
  getBeanDefinitionNames(): string[];
}

export const ListableBeanFactory = declareInterface(
  'org.springframework.beans.factory.ListableBeanFactory',
  { implements: [BeanFactory] },
);
