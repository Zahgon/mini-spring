import { getClass, Reflectable, type JavaClass } from '../../../deps/java/lang/Class.js';
import { JavaHashSet } from '../../../deps/java/util/HashMap.js';
import { Advice } from '../../../deps/aopalliance/index.js';
import { BeansException } from '../../../beans/BeansException.js';
import type { PropertyValues } from '../../../beans/PropertyValues.js';
import type { BeanFactory } from '../../../beans/factory/BeanFactory.js';
import { BeanFactoryAware } from '../../../beans/factory/BeanFactoryAware.js';
import { InstantiationAwareBeanPostProcessor } from '../../../beans/factory/config/InstantiationAwareBeanPostProcessor.js';
import type { DefaultListableBeanFactory } from '../../../beans/factory/support/DefaultListableBeanFactory.js';
import { Advisor } from '../../Advisor.js';
import { AspectJExpressionPointcutAdvisor } from '../../aspectj/AspectJExpressionPointcutAdvisor.js';
import type { ClassFilter } from '../../ClassFilter.js';
import { Pointcut } from '../../Pointcut.js';
import { TargetSource } from '../../TargetSource.js';
import { ProxyFactory } from '../ProxyFactory.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
@Reflectable('org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator', {
  implements: [InstantiationAwareBeanPostProcessor, BeanFactoryAware],
})
export class DefaultAdvisorAutoProxyCreator
  implements InstantiationAwareBeanPostProcessor, BeanFactoryAware
{
  private beanFactory!: DefaultListableBeanFactory;

  private readonly earlyProxyReferences = new JavaHashSet<string>();

  postProcessAfterInitialization(bean: unknown, beanName: string): unknown {
    if (!this.earlyProxyReferences.contains(beanName)) {
      return this.wrapIfNecessary(bean, beanName);
    }

    return bean;
  }

  getEarlyBeanReference(bean: unknown, beanName: string): unknown {
    this.earlyProxyReferences.add(beanName);
    return this.wrapIfNecessary(bean, beanName);
  }

  protected wrapIfNecessary(bean: unknown, beanName: string): unknown {
    // avoid an endless loop
    if (this.isInfrastructureClass(getClass(bean as object))) {
      return bean;
    }

    const advisors = this.beanFactory
      .getBeansOfType<AspectJExpressionPointcutAdvisor>(AspectJExpressionPointcutAdvisor)
      .values();
    try {
      const proxyFactory = new ProxyFactory();
      for (const advisor of advisors) {
        const classFilter: ClassFilter = advisor.getPointcut().getClassFilter();
        if (classFilter.matches(getClass(bean as object))) {
          const targetSource = new TargetSource(bean as object);
          proxyFactory.setTargetSource(targetSource);
          proxyFactory.addAdvisor(advisor);
          proxyFactory.setMethodMatcher(advisor.getPointcut().getMethodMatcher());
        }
      }
      if (proxyFactory.getAdvisors().length !== 0) {
        return proxyFactory.getProxy();
      }
    } catch (ex) {
      throw new BeansException(`Error create proxy bean for: ${beanName}`, ex);
    }
    return bean;
  }

  private isInfrastructureClass(beanClass: JavaClass): boolean {
    return (
      Advice.isAssignableFrom(beanClass) ||
      Pointcut.isAssignableFrom(beanClass) ||
      Advisor.isAssignableFrom(beanClass)
    );
  }

  setBeanFactory(beanFactory: BeanFactory): void {
    this.beanFactory = beanFactory as DefaultListableBeanFactory;
  }

  postProcessBeforeInstantiation(): unknown {
    return null;
  }

  postProcessAfterInstantiation(): boolean {
    return true;
  }

  postProcessBeforeInitialization(bean: unknown): unknown {
    return bean;
  }

  postProcessPropertyValues(pvs: PropertyValues): PropertyValues {
    return pvs;
  }
}
