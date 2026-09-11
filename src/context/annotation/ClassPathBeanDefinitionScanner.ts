import { Reflectable, classOf } from '../../deps/java/lang/Class.js';
import { StrUtil } from '../../deps/hutool/StrUtil.js';
import { AutowiredAnnotationBeanPostProcessor } from '../../beans/factory/annotation/AutowiredAnnotationBeanPostProcessor.js';
import { BeanDefinition } from '../../beans/factory/config/BeanDefinition.js';
import type { BeanDefinitionRegistry } from '../../beans/factory/support/BeanDefinitionRegistry.js';
import { Component } from '../../stereotype/Component.js';
import { ClassPathScanningCandidateComponentProvider } from './ClassPathScanningCandidateComponentProvider.js';
import { Scope } from './Scope.js';

/**
 * @author derekyi
 * @date 2020/12/26
 */
@Reflectable('org.springframework.context.annotation.ClassPathBeanDefinitionScanner')
export class ClassPathBeanDefinitionScanner extends ClassPathScanningCandidateComponentProvider {
  static readonly AUTOWIRED_ANNOTATION_PROCESSOR_BEAN_NAME =
    'org.springframework.context.annotation.internalAutowiredAnnotationProcessor';

  constructor(private readonly registry: BeanDefinitionRegistry) {
    super();
  }

  doScan(...basePackages: string[]): void {
    for (const basePackage of basePackages) {
      const candidates = this.findCandidateComponents(basePackage);
      for (const candidate of candidates) {
        // resolve the bean's scope
        const beanScope = this.resolveBeanScope(candidate);
        if (StrUtil.isNotEmpty(beanScope)) {
          candidate.setScope(beanScope);
        }
        // derive the bean's name
        const beanName = this.determineBeanName(candidate);
        // register the BeanDefinition
        this.registry.registerBeanDefinition(beanName, candidate);
      }
    }

    // register the BeanPostProcessor that handles @Autowired and @Value
    this.registry.registerBeanDefinition(
      ClassPathBeanDefinitionScanner.AUTOWIRED_ANNOTATION_PROCESSOR_BEAN_NAME,
      new BeanDefinition(classOf(AutowiredAnnotationBeanPostProcessor)),
    );
  }

  /**
   * Returns the bean's scope.
   */
  private resolveBeanScope(beanDefinition: BeanDefinition): string {
    const beanClass = beanDefinition.getBeanClass();
    const scope = beanClass.getAnnotation(Scope.annotationType);
    if (scope !== null) {
      return scope.value;
    }

    return StrUtil.EMPTY;
  }

  /**
   * Derives the bean's name.
   */
  private determineBeanName(beanDefinition: BeanDefinition): string {
    const beanClass = beanDefinition.getBeanClass();
    const component = beanClass.getAnnotation(Component.annotationType)!;
    let value = component.value;
    if (StrUtil.isEmpty(value)) {
      value = StrUtil.lowerFirst(beanClass.getSimpleName());
    }
    return value;
  }
}
