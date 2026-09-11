import { getClass, Reflectable, type JavaClass } from '../../../deps/java/lang/Class.js';
import { BeanUtil } from '../../../deps/hutool/BeanUtil.js';
import { ClassUtil } from '../../../deps/hutool/ClassUtil.js';
import { StrUtil } from '../../../deps/hutool/StrUtil.js';
import { TypeUtil } from '../../../deps/hutool/TypeUtil.js';
import { BeansException } from '../../BeansException.js';
import type { PropertyValues } from '../../PropertyValues.js';
import { AutowireCapableBeanFactory } from '../config/AutowireCapableBeanFactory.js';
import type { BeanDefinition } from '../config/BeanDefinition.js';
import { BeanReference } from '../config/BeanReference.js';
import {
  getEarlyBeanReference as invokeGetEarlyBeanReference,
  InstantiationAwareBeanPostProcessor,
} from '../config/InstantiationAwareBeanPostProcessor.js';
import { BeanFactoryAware } from '../BeanFactoryAware.js';
import { DisposableBean } from '../DisposableBean.js';
import { InitializingBean } from '../InitializingBean.js';
import type { ObjectFactory } from '../ObjectFactory.js';
import { AbstractBeanFactory } from './AbstractBeanFactory.js';
import { DisposableBeanAdapter } from './DisposableBeanAdapter.js';
import type { InstantiationStrategy } from './InstantiationStrategy.js';
import { SimpleInstantiationStrategy } from './SimpleInstantiationStrategy.js';

/**
 * @author derekyi
 * @date 2020/11/22
 */
@Reflectable('org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory', {
  implements: [AutowireCapableBeanFactory],
})
export abstract class AbstractAutowireCapableBeanFactory
  extends AbstractBeanFactory
  implements AutowireCapableBeanFactory
{
  private instantiationStrategy: InstantiationStrategy = new SimpleInstantiationStrategy();

  protected override createBean(beanName: string, beanDefinition: BeanDefinition): unknown {
    // if the bean needs a proxy, return the proxy straight away
    const bean = this.resolveBeforeInstantiation(beanName, beanDefinition);
    if (bean !== null) {
      return bean;
    }

    return this.doCreateBean(beanName, beanDefinition);
  }

  /**
   * Runs the InstantiationAwareBeanPostProcessor methods; if the bean needs a
   * proxy, returns the proxy directly.
   */
  protected resolveBeforeInstantiation(
    beanName: string,
    beanDefinition: BeanDefinition,
  ): unknown {
    let bean = this.applyBeanPostProcessorsBeforeInstantiation(
      beanDefinition.getBeanClass(),
      beanName,
    );
    if (bean !== null) {
      bean = this.applyBeanPostProcessorsAfterInitialization(bean, beanName);
    }
    return bean;
  }

  protected applyBeanPostProcessorsBeforeInstantiation(
    beanClass: JavaClass,
    beanName: string,
  ): unknown {
    for (const beanPostProcessor of this.getBeanPostProcessors()) {
      if (InstantiationAwareBeanPostProcessor.isInstance(beanPostProcessor)) {
        const result = (
          beanPostProcessor as InstantiationAwareBeanPostProcessor
        ).postProcessBeforeInstantiation(beanClass, beanName);
        if (result !== null) {
          return result;
        }
      }
    }

    return null;
  }

  protected doCreateBean(beanName: string, beanDefinition: BeanDefinition): unknown {
    let bean: object;
    try {
      bean = this.createBeanInstance(beanDefinition);

      // expose the freshly instantiated bean through the cache so that
      // circular references can be resolved
      if (beanDefinition.isSingleton()) {
        const finalBean = bean;
        const factory: ObjectFactory<unknown> = {
          getObject: (): unknown => this.getEarlyBeanReference(beanName, beanDefinition, finalBean),
        };
        this.addSingletonFactory(beanName, factory);
      }

      // runs after the bean has been instantiated
      const continueWithPropertyPopulation = this.applyBeanPostProcessorsAfterInstantiation(
        beanName,
        bean,
      );
      if (!continueWithPropertyPopulation) {
        return bean;
      }
      // allow a BeanPostProcessor to modify the property values before they are set
      this.applyBeanPostProcessorsBeforeApplyingPropertyValues(beanName, bean, beanDefinition);
      // populate the bean's properties
      this.applyPropertyValues(beanName, bean, beanDefinition);
      // run the bean's initialisation method plus the BeanPostProcessor callbacks
      bean = this.initializeBean(beanName, bean, beanDefinition) as object;
    } catch (e) {
      throw new BeansException('Instantiation of bean failed', e);
    }

    // register the bean if it has a destruction method
    this.registerDisposableBeanIfNecessary(beanName, bean, beanDefinition);

    let exposedObject: unknown = bean;
    if (beanDefinition.isSingleton()) {
      // pick up the proxy, if there is one
      const earlySingletonReference = this.getSingleton(beanName, false);
      if (earlySingletonReference !== null) {
        // keep the first- and second-level caches consistent
        exposedObject = earlySingletonReference;
      }
      this.addSingleton(beanName, exposedObject);
    }
    return exposedObject;
  }

  protected getEarlyBeanReference(
    beanName: string,
    _beanDefinition: BeanDefinition,
    bean: unknown,
  ): unknown {
    let exposedObject = bean;
    for (const bp of this.getBeanPostProcessors()) {
      if (InstantiationAwareBeanPostProcessor.isInstance(bp)) {
        exposedObject = invokeGetEarlyBeanReference(
          bp as InstantiationAwareBeanPostProcessor,
          exposedObject,
          beanName,
        );
        if (exposedObject === null) {
          return exposedObject;
        }
      }
    }

    return exposedObject;
  }

  /**
   * Runs after the bean has been instantiated; returning false skips the
   * property-setting logic that follows.
   */
  private applyBeanPostProcessorsAfterInstantiation(beanName: string, bean: unknown): boolean {
    let continueWithPropertyPopulation = true;
    for (const beanPostProcessor of this.getBeanPostProcessors()) {
      if (InstantiationAwareBeanPostProcessor.isInstance(beanPostProcessor)) {
        if (
          !(beanPostProcessor as InstantiationAwareBeanPostProcessor).postProcessAfterInstantiation(
            bean,
            beanName,
          )
        ) {
          continueWithPropertyPopulation = false;
          break;
        }
      }
    }
    return continueWithPropertyPopulation;
  }

  /**
   * Allows a BeanPostProcessor to modify the property values before they are set.
   */
  protected applyBeanPostProcessorsBeforeApplyingPropertyValues(
    beanName: string,
    bean: unknown,
    beanDefinition: BeanDefinition,
  ): void {
    for (const beanPostProcessor of this.getBeanPostProcessors()) {
      if (InstantiationAwareBeanPostProcessor.isInstance(beanPostProcessor)) {
        const pvs: PropertyValues | null = (
          beanPostProcessor as InstantiationAwareBeanPostProcessor
        ).postProcessPropertyValues(beanDefinition.getPropertyValues(), bean, beanName);
        if (pvs !== null) {
          for (const propertyValue of pvs.getPropertyValues()) {
            beanDefinition.getPropertyValues().addPropertyValue(propertyValue);
          }
        }
      }
    }
  }

  /**
   * Registers a bean that has a destruction method, i.e. a bean that
   * implements DisposableBean or declares a custom destruction method.
   */
  protected registerDisposableBeanIfNecessary(
    beanName: string,
    bean: object,
    beanDefinition: BeanDefinition,
  ): void {
    // only singleton beans run their destruction method
    if (beanDefinition.isSingleton()) {
      if (
        DisposableBean.isInstance(bean) ||
        StrUtil.isNotEmpty(beanDefinition.getDestroyMethodName())
      ) {
        this.registerDisposableBean(
          beanName,
          new DisposableBeanAdapter(bean, beanName, beanDefinition),
        );
      }
    }
  }

  /**
   * Instantiates the bean.
   */
  protected createBeanInstance(beanDefinition: BeanDefinition): object {
    return this.getInstantiationStrategy().instantiate(beanDefinition);
  }

  /**
   * Populates the bean's properties.
   */
  protected applyPropertyValues(
    beanName: string,
    bean: object,
    beanDefinition: BeanDefinition,
  ): void {
    try {
      for (const propertyValue of beanDefinition.getPropertyValues().getPropertyValues()) {
        const name = propertyValue.getName();
        let value = propertyValue.getValue();
        if (value instanceof BeanReference) {
          // beanA depends on beanB, so instantiate beanB first
          value = this.getBean(value.getBeanName());
        } else {
          // type conversion
          const sourceType = getClass(value as object);
          const targetType = TypeUtil.getFieldType(getClass(bean), name);
          const conversionService = this.getConversionService();
          if (conversionService !== null && targetType !== null) {
            if (conversionService.canConvert(sourceType, targetType)) {
              value = conversionService.convert(value, targetType);
            }
          }
        }

        // set the field reflectively
        BeanUtil.setFieldValue(bean, name, value);
      }
    } catch (ex) {
      throw new BeansException(`Error setting property values for bean: ${beanName}`, ex);
    }
  }

  protected initializeBean(beanName: string, bean: object, beanDefinition: BeanDefinition): unknown {
    if (BeanFactoryAware.isInstance(bean)) {
      (bean as BeanFactoryAware).setBeanFactory(this);
    }

    // the BeanPostProcessor "before" callbacks
    let wrappedBean = this.applyBeanPostProcessorsBeforeInitialization(bean, beanName);

    try {
      this.invokeInitMethods(beanName, wrappedBean, beanDefinition);
    } catch (ex) {
      throw new BeansException(`Invocation of init method of bean[${beanName}] failed`, ex);
    }

    // the BeanPostProcessor "after" callbacks
    wrappedBean = this.applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
    return wrappedBean;
  }

  applyBeanPostProcessorsBeforeInitialization(existingBean: unknown, beanName: string): unknown {
    let result = existingBean;
    for (const processor of this.getBeanPostProcessors()) {
      const current = processor.postProcessBeforeInitialization(result, beanName);
      if (current === null) {
        return result;
      }
      result = current;
    }
    return result;
  }

  applyBeanPostProcessorsAfterInitialization(existingBean: unknown, beanName: string): unknown {
    let result = existingBean;
    for (const processor of this.getBeanPostProcessors()) {
      const current = processor.postProcessAfterInitialization(result, beanName);
      if (current === null) {
        return result;
      }
      result = current;
    }
    return result;
  }

  /**
   * Runs the bean's initialisation method.
   */
  protected invokeInitMethods(
    beanName: string,
    bean: unknown,
    beanDefinition: BeanDefinition,
  ): void {
    if (InitializingBean.isInstance(bean)) {
      (bean as InitializingBean).afterPropertiesSet();
    }
    const initMethodName = beanDefinition.getInitMethodName();
    if (
      StrUtil.isNotEmpty(initMethodName) &&
      !(InitializingBean.isInstance(bean) && initMethodName === 'afterPropertiesSet')
    ) {
      const initMethod = ClassUtil.getPublicMethod(beanDefinition.getBeanClass(), initMethodName);
      if (initMethod === null) {
        throw new BeansException(
          `Could not find an init method named '${initMethodName}' on bean with name '${beanName}'`,
        );
      }
      initMethod.invoke(bean);
    }
  }

  getInstantiationStrategy(): InstantiationStrategy {
    return this.instantiationStrategy;
  }

  setInstantiationStrategy(instantiationStrategy: InstantiationStrategy): void {
    this.instantiationStrategy = instantiationStrategy;
  }
}
