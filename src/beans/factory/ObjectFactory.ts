import { declareInterface } from '../../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2021/1/30
 */
export interface ObjectFactory<T> {
  getObject(): T;
}

export const ObjectFactory = declareInterface('org.springframework.beans.factory.ObjectFactory');
