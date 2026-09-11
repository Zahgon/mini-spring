import { declareInterface, type TypeRef } from '../../deps/java/lang/Class.js';

/**
 * bean container
 *
 * @author derekyi
 * @date 2020/11/22
 */
export interface BeanFactory {
  /**
   * Returns a bean.
   *
   * @throws BeansException when the bean does not exist
   */
  getBean(name: string): unknown;

  /** Looks a bean up by name and type. */
  getBean<T>(name: string, requiredType: TypeRef): T;

  getBean<T>(requiredType: TypeRef): T;

  containsBean(name: string): boolean;
}

export const BeanFactory = declareInterface('org.springframework.beans.factory.BeanFactory');
