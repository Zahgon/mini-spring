import { Reflectable } from '../../deps/java/lang/Class.js';
import { JavaHashSet } from '../../deps/java/util/HashMap.js';
import type { BeanFactory } from '../../beans/factory/BeanFactory.js';
import { BeanFactoryAware } from '../../beans/factory/BeanFactoryAware.js';
import type { ApplicationEvent } from '../ApplicationEvent.js';
import type { ApplicationListener } from '../ApplicationListener.js';
import { ApplicationEventMulticaster } from './ApplicationEventMulticaster.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
@Reflectable('org.springframework.context.event.AbstractApplicationEventMulticaster', {
  implements: [ApplicationEventMulticaster, BeanFactoryAware],
})
export abstract class AbstractApplicationEventMulticaster
  implements ApplicationEventMulticaster, BeanFactoryAware
{
  readonly applicationListeners = new JavaHashSet<ApplicationListener<ApplicationEvent>>();

  protected beanFactory!: BeanFactory;

  addApplicationListener(listener: ApplicationListener<ApplicationEvent>): void {
    this.applicationListeners.add(listener);
  }

  removeApplicationListener(listener: ApplicationListener<ApplicationEvent>): void {
    this.applicationListeners.remove(listener);
  }

  setBeanFactory(beanFactory: BeanFactory): void {
    this.beanFactory = beanFactory;
  }

  abstract multicastEvent(event: ApplicationEvent): void;
}
