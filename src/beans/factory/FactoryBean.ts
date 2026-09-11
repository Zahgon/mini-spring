import { declareInterface } from '../../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/12/2
 */
export interface FactoryBean<T> {
  getObject(): T;

  isSingleton(): boolean;
}

export const FactoryBean = declareInterface('org.springframework.beans.factory.FactoryBean');
