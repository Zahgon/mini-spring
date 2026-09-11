import { Reflectable } from '../../../deps/java/lang/Class.js';
import { DefaultResourceLoader } from '../../../core/io/DefaultResourceLoader.js';
import { Resource } from '../../../core/io/Resource.js';
import type { ResourceLoader } from '../../../core/io/ResourceLoader.js';
import { BeanDefinitionReader } from './BeanDefinitionReader.js';
import type { BeanDefinitionRegistry } from './BeanDefinitionRegistry.js';

/**
 * @author derekyi
 * @date 2020/11/26
 */
@Reflectable('org.springframework.beans.factory.support.AbstractBeanDefinitionReader', {
  implements: [BeanDefinitionReader],
})
export abstract class AbstractBeanDefinitionReader implements BeanDefinitionReader {
  private resourceLoader: ResourceLoader;

  constructor(
    private readonly registry: BeanDefinitionRegistry,
    resourceLoader: ResourceLoader = new DefaultResourceLoader(),
  ) {
    this.resourceLoader = resourceLoader;
  }

  getRegistry(): BeanDefinitionRegistry {
    return this.registry;
  }

  loadBeanDefinitions(resource: Resource): void;
  loadBeanDefinitions(location: string): void;
  loadBeanDefinitions(locations: string[]): void;
  loadBeanDefinitions(target: Resource | string | string[]): void {
    if (Array.isArray(target)) {
      for (const location of target) {
        this.loadBeanDefinitions(location);
      }
      return;
    }
    if (typeof target === 'string') {
      this.loadBeanDefinitionsFromLocation(target);
      return;
    }
    this.loadBeanDefinitionsFromResource(target);
  }

  protected abstract loadBeanDefinitionsFromLocation(location: string): void;

  protected abstract loadBeanDefinitionsFromResource(resource: Resource): void;

  setResourceLoader(resourceLoader: ResourceLoader): void {
    this.resourceLoader = resourceLoader;
  }

  getResourceLoader(): ResourceLoader {
    return this.resourceLoader;
  }
}
