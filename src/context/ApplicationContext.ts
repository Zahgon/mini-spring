import { declareInterface } from '../deps/java/lang/Class.js';
import { HierarchicalBeanFactory } from '../beans/factory/HierarchicalBeanFactory.js';
import { ListableBeanFactory } from '../beans/factory/ListableBeanFactory.js';
import { ResourceLoader } from '../core/io/ResourceLoader.js';
import { ApplicationEventPublisher } from './ApplicationEventPublisher.js';

/**
 * The application context
 *
 * @author derekyi
 * @date 2020/11/28
 */
export interface ApplicationContext
  extends ListableBeanFactory,
    HierarchicalBeanFactory,
    ResourceLoader,
    ApplicationEventPublisher {}

export const ApplicationContext = declareInterface('org.springframework.context.ApplicationContext', {
  implements: [ListableBeanFactory, HierarchicalBeanFactory, ResourceLoader, ApplicationEventPublisher],
});
