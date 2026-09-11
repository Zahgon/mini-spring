import { declareInterface } from '../../deps/java/lang/Class.js';
import { BeanFactory } from './BeanFactory.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HierarchicalBeanFactory extends BeanFactory {}

export const HierarchicalBeanFactory = declareInterface(
  'org.springframework.beans.factory.HierarchicalBeanFactory',
  { implements: [BeanFactory] },
);
