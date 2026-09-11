import { asClass, Reflectable, type JavaClass, type TypeRef } from '../../../deps/java/lang/Class.js';
import { stringValueOf } from '../../../deps/java/lang/Boxed.js';
import { JavaConcurrentHashMap, JavaHashMap } from '../../../deps/java/util/HashMap.js';
import { BeansException } from '../../BeansException.js';
import { ConfigurableListableBeanFactory } from '../ConfigurableListableBeanFactory.js';
import type { BeanDefinition } from '../config/BeanDefinition.js';
import { AbstractAutowireCapableBeanFactory } from './AbstractAutowireCapableBeanFactory.js';
import { BeanDefinitionRegistry } from './BeanDefinitionRegistry.js';

/**
 * @author derekyi
 * @date 2020/11/22
 */
@Reflectable('org.springframework.beans.factory.support.DefaultListableBeanFactory', {
  implements: [ConfigurableListableBeanFactory, BeanDefinitionRegistry],
})
export class DefaultListableBeanFactory
  extends AbstractAutowireCapableBeanFactory
  implements ConfigurableListableBeanFactory, BeanDefinitionRegistry
{
  private readonly beanDefinitionMap = new JavaConcurrentHashMap<string, BeanDefinition>(256);

  registerBeanDefinition(beanName: string, beanDefinition: BeanDefinition): void {
    this.beanDefinitionMap.put(beanName, beanDefinition);
  }

  override getBeanDefinition(beanName: string): BeanDefinition {
    const beanDefinition = this.beanDefinitionMap.get(beanName);
    if (beanDefinition === undefined) {
      throw new BeansException(`No bean named '${beanName}' is defined`);
    }

    return beanDefinition;
  }

  override containsBeanDefinition(beanName: string): boolean {
    return this.beanDefinitionMap.containsKey(beanName);
  }

  getBeansOfType<T>(type: TypeRef): JavaHashMap<string, T> {
    const requiredType = asClass(type);
    const result = new JavaHashMap<string, T>();
    this.beanDefinitionMap.forEach((beanDefinition, beanName) => {
      const beanClass = beanDefinition.getBeanClass();
      if (requiredType.isAssignableFrom(beanClass)) {
        const bean = this.getBean(beanName) as T;
        result.put(beanName, bean);
      }
    });
    return result;
  }

  protected override getBeanByType(requiredType: JavaClass): unknown {
    const beanNames: string[] = [];
    for (const [beanName, beanDefinition] of this.beanDefinitionMap) {
      const beanClass = beanDefinition.getBeanClass();
      if (requiredType.isAssignableFrom(beanClass)) {
        beanNames.push(beanName);
      }
    }
    if (beanNames.length === 1) {
      return this.getBean(beanNames[0]!, requiredType);
    }

    throw new BeansException(
      `${requiredType.toString()}expected single bean but found ${String(beanNames.length)}: ${stringValueOf(beanNames)}`,
    );
  }

  getBeanDefinitionNames(): string[] {
    return this.beanDefinitionMap.keys();
  }

  preInstantiateSingletons(): void {
    this.beanDefinitionMap.forEach((beanDefinition, beanName) => {
      // a bean is created eagerly only when it is a singleton and not lazy
      if (beanDefinition.isSingleton() && !beanDefinition.isLazyInit()) {
        this.getBean(beanName);
      }
    });
  }
}
