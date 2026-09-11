import {
  forName,
  getClass,
  JavaParameterizedType,
  Reflectable,
} from '../../deps/java/lang/Class.js';
import { ClassNotFoundException } from '../../deps/java/lang/Exceptions.js';
import { BeansException } from '../../beans/BeansException.js';
import type { BeanFactory } from '../../beans/factory/BeanFactory.js';
import type { ApplicationEvent } from '../ApplicationEvent.js';
import type { ApplicationListener } from '../ApplicationListener.js';
import { AbstractApplicationEventMulticaster } from './AbstractApplicationEventMulticaster.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
@Reflectable('org.springframework.context.event.SimpleApplicationEventMulticaster')
export class SimpleApplicationEventMulticaster extends AbstractApplicationEventMulticaster {
  constructor(beanFactory: BeanFactory) {
    super();
    this.setBeanFactory(beanFactory);
  }

  multicastEvent(event: ApplicationEvent): void {
    for (const applicationListener of this.applicationListeners) {
      if (this.supportsEvent(applicationListener, event)) {
        applicationListener.onApplicationEvent(event);
      }
    }
  }

  /**
   * Whether the listener is interested in this event.
   */
  protected supportsEvent(
    applicationListener: ApplicationListener<ApplicationEvent>,
    event: ApplicationEvent,
  ): boolean {
    const type = getClass(applicationListener).getGenericInterfaces()[0];
    if (!(type instanceof JavaParameterizedType)) {
      throw new BeansException(
        `wrong event class name: ${type === undefined ? 'null' : type.getTypeName()}`,
      );
    }
    const actualTypeArgument = type.getActualTypeArguments()[0]!;
    const className = actualTypeArgument.getTypeName();
    try {
      const eventClassName = forName(className);
      return eventClassName.isAssignableFrom(getClass(event));
    } catch (e) {
      if (e instanceof ClassNotFoundException) {
        throw new BeansException(`wrong event class name: ${className}`);
      }
      throw e;
    }
  }
}
