import { declareInterface } from '../../../deps/java/lang/Class.js';

/**
 * Singleton registry
 *
 * @author derekyi
 * @date 2020/11/22
 */
export interface SingletonBeanRegistry {
  getSingleton(beanName: string): unknown;

  addSingleton(beanName: string, singletonObject: unknown): void;
}

export const SingletonBeanRegistry = declareInterface(
  'org.springframework.beans.factory.config.SingletonBeanRegistry',
);
