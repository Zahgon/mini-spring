import { declareInterface } from '../../../deps/java/lang/Class.js';
import type { Resource } from '../../../core/io/Resource.js';
import type { ResourceLoader } from '../../../core/io/ResourceLoader.js';
import type { BeanDefinitionRegistry } from './BeanDefinitionRegistry.js';

/**
 * The interface for reading bean definitions, i.e. BeanDefinition instances
 *
 * @author derekyi
 * @date 2020/11/26
 */
export interface BeanDefinitionReader {
  getRegistry(): BeanDefinitionRegistry;

  getResourceLoader(): ResourceLoader;

  loadBeanDefinitions(resource: Resource): void;

  loadBeanDefinitions(location: string): void;

  loadBeanDefinitions(locations: string[]): void;
}

export const BeanDefinitionReader = declareInterface(
  'org.springframework.beans.factory.support.BeanDefinitionReader',
);
