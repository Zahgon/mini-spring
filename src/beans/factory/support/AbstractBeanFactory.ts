import { asClass, Reflectable, type JavaClass, type TypeRef } from '../../../deps/java/lang/Class.js';
import { JavaHashMap } from '../../../deps/java/util/HashMap.js';
import type { ConversionService } from '../../../core/convert/ConversionService.js';
import type { StringValueResolver } from '../../../util/StringValueResolver.js';
import { BeansException } from '../../BeansException.js';
import { ConfigurableBeanFactory } from '../config/ConfigurableBeanFactory.js';
import type { BeanDefinition } from '../config/BeanDefinition.js';
import type { BeanPostProcessor } from '../config/BeanPostProcessor.js';
import { FactoryBean } from '../FactoryBean.js';
import { DefaultSingletonBeanRegistry } from './DefaultSingletonBeanRegistry.js';

/**
 * @author derekyi
 * @date 2020/11/22
 */
@Reflectable('org.springframework.beans.factory.support.AbstractBeanFactory', {
  implements: [ConfigurableBeanFactory],
})
export abstract class AbstractBeanFactory
  extends DefaultSingletonBeanRegistry
  implements ConfigurableBeanFactory
{
  private readonly beanPostProcessors: BeanPostProcessor[] = [];

  private readonly factoryBeanObjectCache = new JavaHashMap<string, unknown>();

  private readonly embeddedValueResolvers: StringValueResolver[] = [];

  private conversionService: ConversionService | null = null;

  getBean(name: string): unknown;
  getBean<T>(name: string, requiredType: TypeRef): T;
  getBean<T>(requiredType: TypeRef): T;
  getBean(nameOrType: string | TypeRef, _requiredType?: TypeRef): unknown {
    if (typeof nameOrType !== 'string') {
      return this.getBeanByType(asClass(nameOrType));
    }
    const name = nameOrType;
    const sharedInstance = this.getSingleton(name);
    if (sharedInstance !== null) {
      // if it is a FactoryBean, create the bean from FactoryBean#getObject
      return this.getObjectForBeanInstance(sharedInstance, name);
    }

    const beanDefinition = this.getBeanDefinition(name);
    const bean = this.createBean(name, beanDefinition);
    return this.getObjectForBeanInstance(bean, name);
  }

  /**
   * If it is a FactoryBean, create the bean from FactoryBean#getObject.
   */
  protected getObjectForBeanInstance(beanInstance: unknown, beanName: string): unknown {
    let object = beanInstance;
    if (FactoryBean.isInstance(beanInstance)) {
      const factoryBean = beanInstance as FactoryBean<unknown>;
      try {
        if (factoryBean.isSingleton()) {
          // a singleton-scoped bean is served from the cache
          const cached = this.factoryBeanObjectCache.get(beanName);
          if (cached === undefined) {
            object = factoryBean.getObject();
            this.factoryBeanObjectCache.put(beanName, object);
          } else {
            object = cached;
          }
        } else {
          // a prototype-scoped bean is created afresh
          object = factoryBean.getObject();
        }
      } catch (ex) {
        throw new BeansException(
          `FactoryBean threw exception on object[${beanName}] creation`,
          ex,
        );
      }
    }

    return object;
  }

  containsBean(name: string): boolean {
    return this.containsBeanDefinition(name);
  }

  protected abstract containsBeanDefinition(beanName: string): boolean;

  protected abstract createBean(beanName: string, beanDefinition: BeanDefinition): unknown;

  abstract getBeanDefinition(beanName: string): BeanDefinition;

  /**
   * The by-type lookup, which the original declares on
   * `DefaultListableBeanFactory` and reaches through the `getBean(Class)`
   * overload.
   */
  protected abstract getBeanByType(requiredType: JavaClass): unknown;

  addBeanPostProcessor(beanPostProcessor: BeanPostProcessor): void {
    // replace an existing registration
    const existing = this.beanPostProcessors.indexOf(beanPostProcessor);
    if (existing >= 0) {
      this.beanPostProcessors.splice(existing, 1);
    }
    this.beanPostProcessors.push(beanPostProcessor);
  }

  getBeanPostProcessors(): BeanPostProcessor[] {
    return this.beanPostProcessors;
  }

  addEmbeddedValueResolver(valueResolver: StringValueResolver): void {
    this.embeddedValueResolvers.push(valueResolver);
  }

  resolveEmbeddedValue(value: string): string {
    let result = value;
    for (const resolver of this.embeddedValueResolvers) {
      result = resolver.resolveStringValue(result);
    }
    return result;
  }

  getConversionService(): ConversionService | null {
    return this.conversionService;
  }

  setConversionService(conversionService: ConversionService): void {
    this.conversionService = conversionService;
  }
}
