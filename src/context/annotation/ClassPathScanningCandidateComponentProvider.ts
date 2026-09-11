import { Reflectable } from '../../deps/java/lang/Class.js';
import { ClassUtil } from '../../deps/hutool/ClassUtil.js';
import { BeanDefinition } from '../../beans/factory/config/BeanDefinition.js';
import { Component } from '../../stereotype/Component.js';

/**
 * @author derekyi
 * @date 2020/12/26
 */
@Reflectable('org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider')
export class ClassPathScanningCandidateComponentProvider {
  findCandidateComponents(basePackage: string): Set<BeanDefinition> {
    const candidates = new Set<BeanDefinition>();
    // scan for classes annotated with org.springframework.stereotype.Component
    const classes = ClassUtil.scanPackageByAnnotation(basePackage, Component.annotationType);
    for (const clazz of classes) {
      const beanDefinition = new BeanDefinition(clazz);
      candidates.add(beanDefinition);
    }
    return candidates;
  }
}
