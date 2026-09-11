import { Reflectable, type TypeRef } from '../../deps/java/lang/Class.js';
import { Runtime } from '../../deps/java/lang/Runtime.js';
import type { JavaHashMap } from '../../deps/java/util/HashMap.js';
import { ConversionService } from '../../core/convert/ConversionService.js';
import { DefaultResourceLoader } from '../../core/io/DefaultResourceLoader.js';
import type { ConfigurableListableBeanFactory } from '../../beans/factory/ConfigurableListableBeanFactory.js';
import { BeanFactoryPostProcessor } from '../../beans/factory/config/BeanFactoryPostProcessor.js';
import { BeanPostProcessor } from '../../beans/factory/config/BeanPostProcessor.js';
import type { ApplicationEvent } from '../ApplicationEvent.js';
import { ApplicationListener } from '../ApplicationListener.js';
import { ConfigurableApplicationContext } from '../ConfigurableApplicationContext.js';
import type { ApplicationEventMulticaster } from '../event/ApplicationEventMulticaster.js';
import { ContextClosedEvent } from '../event/ContextClosedEvent.js';
import { ContextRefreshedEvent } from '../event/ContextRefreshedEvent.js';
import { SimpleApplicationEventMulticaster } from '../event/SimpleApplicationEventMulticaster.js';
import { ApplicationContextAwareProcessor } from './ApplicationContextAwareProcessor.js';

/**
 * The abstract application context
 *
 * @author derekyi
 * @date 2020/11/28
 */
@Reflectable('org.springframework.context.support.AbstractApplicationContext', {
  implements: [ConfigurableApplicationContext],
})
export abstract class AbstractApplicationContext
  extends DefaultResourceLoader
  implements ConfigurableApplicationContext
{
  static readonly APPLICATION_EVENT_MULTICASTER_BEAN_NAME = 'applicationEventMulticaster';

  static readonly CONVERSION_SERVICE_BEAN_NAME = 'conversionService';

  private applicationEventMulticaster!: ApplicationEventMulticaster;

  refresh(): void {
    // create the BeanFactory and load the BeanDefinition instances
    this.refreshBeanFactory();
    const beanFactory = this.getBeanFactory();

    // add the ApplicationContextAwareProcessor so that a bean implementing
    // ApplicationContextAware can be made aware of the container
    beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));

    // run the BeanFactoryPostProcessor instances before any bean is instantiated
    this.invokeBeanFactoryPostProcessors(beanFactory);

    // a BeanPostProcessor has to be registered before the other beans are instantiated
    this.registerBeanPostProcessors(beanFactory);

    // initialise the event publisher
    this.initApplicationEventMulticaster();

    // register the event listeners
    this.registerListeners();

    // register the type converters and instantiate the singleton beans eagerly
    this.finishBeanFactoryInitialization(beanFactory);

    // publish the "context refreshed" event
    this.finishRefresh();
  }

  protected finishBeanFactoryInitialization(beanFactory: ConfigurableListableBeanFactory): void {
    // install the type converter
    if (beanFactory.containsBean(AbstractApplicationContext.CONVERSION_SERVICE_BEAN_NAME)) {
      const conversionService = beanFactory.getBean(
        AbstractApplicationContext.CONVERSION_SERVICE_BEAN_NAME,
      );
      if (ConversionService.isInstance(conversionService)) {
        beanFactory.setConversionService(conversionService as ConversionService);
      }
    }

    // instantiate the singleton beans eagerly
    beanFactory.preInstantiateSingletons();
  }

  /**
   * Creates the BeanFactory and loads the BeanDefinition instances.
   */
  protected abstract refreshBeanFactory(): void;

  /**
   * Runs the BeanFactoryPostProcessor instances before any bean is instantiated.
   */
  protected invokeBeanFactoryPostProcessors(beanFactory: ConfigurableListableBeanFactory): void {
    const beanFactoryPostProcessorMap =
      beanFactory.getBeansOfType<BeanFactoryPostProcessor>(BeanFactoryPostProcessor);
    for (const beanFactoryPostProcessor of beanFactoryPostProcessorMap.values()) {
      beanFactoryPostProcessor.postProcessBeanFactory(beanFactory);
    }
  }

  /**
   * Registers the BeanPostProcessor instances.
   */
  protected registerBeanPostProcessors(beanFactory: ConfigurableListableBeanFactory): void {
    const beanPostProcessorMap = beanFactory.getBeansOfType<BeanPostProcessor>(BeanPostProcessor);
    for (const beanPostProcessor of beanPostProcessorMap.values()) {
      beanFactory.addBeanPostProcessor(beanPostProcessor);
    }
  }

  /**
   * Initialises the event publisher.
   */
  protected initApplicationEventMulticaster(): void {
    const beanFactory = this.getBeanFactory();
    this.applicationEventMulticaster = new SimpleApplicationEventMulticaster(beanFactory);
    beanFactory.addSingleton(
      AbstractApplicationContext.APPLICATION_EVENT_MULTICASTER_BEAN_NAME,
      this.applicationEventMulticaster,
    );
  }

  /**
   * Registers the event listeners.
   */
  protected registerListeners(): void {
    const applicationListeners = this.getBeansOfType<ApplicationListener<ApplicationEvent>>(
      ApplicationListener,
    ).values();
    for (const applicationListener of applicationListeners) {
      this.applicationEventMulticaster.addApplicationListener(applicationListener);
    }
  }

  /**
   * Publishes the "context refreshed" event.
   */
  protected finishRefresh(): void {
    this.publishEvent(new ContextRefreshedEvent(this));
  }

  publishEvent(event: ApplicationEvent): void {
    this.applicationEventMulticaster.multicastEvent(event);
  }

  containsBean(name: string): boolean {
    return this.getBeanFactory().containsBean(name);
  }

  getBean(name: string): unknown;
  getBean<T>(name: string, requiredType: TypeRef): T;
  getBean<T>(requiredType: TypeRef): T;
  getBean(nameOrType: string | TypeRef, requiredType?: TypeRef): unknown {
    if (typeof nameOrType !== 'string') {
      return this.getBeanFactory().getBean(nameOrType);
    }
    if (requiredType === undefined) {
      return this.getBeanFactory().getBean(nameOrType);
    }
    return this.getBeanFactory().getBean(nameOrType, requiredType);
  }

  getBeansOfType<T>(type: TypeRef): JavaHashMap<string, T> {
    return this.getBeanFactory().getBeansOfType<T>(type);
  }

  getBeanDefinitionNames(): string[] {
    return this.getBeanFactory().getBeanDefinitionNames();
  }

  abstract getBeanFactory(): ConfigurableListableBeanFactory;

  close(): void {
    this.doClose();
  }

  registerShutdownHook(): void {
    Runtime.getRuntime().addShutdownHook({
      run: (): void => {
        this.doClose();
      },
    });
  }

  protected doClose(): void {
    // publish the "context closed" event
    this.publishEvent(new ContextClosedEvent(this));

    // run the destruction methods of the singleton beans
    this.destroyBeans();
  }

  protected destroyBeans(): void {
    this.getBeanFactory().destroySingletons();
  }
}
