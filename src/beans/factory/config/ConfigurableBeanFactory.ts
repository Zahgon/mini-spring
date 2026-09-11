import { declareInterface } from '../../../deps/java/lang/Class.js';
import type { ConversionService } from '../../../core/convert/ConversionService.js';
import type { StringValueResolver } from '../../../util/StringValueResolver.js';
import { HierarchicalBeanFactory } from '../HierarchicalBeanFactory.js';
import type { BeanPostProcessor } from './BeanPostProcessor.js';
import { SingletonBeanRegistry } from './SingletonBeanRegistry.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
export interface ConfigurableBeanFactory extends HierarchicalBeanFactory, SingletonBeanRegistry {
  addBeanPostProcessor(beanPostProcessor: BeanPostProcessor): void;

  /** Destroys the singleton beans. */
  destroySingletons(): void;

  addEmbeddedValueResolver(valueResolver: StringValueResolver): void;

  resolveEmbeddedValue(value: string): string;

  setConversionService(conversionService: ConversionService): void;

  getConversionService(): ConversionService | null;
}

export const ConfigurableBeanFactory = declareInterface(
  'org.springframework.beans.factory.config.ConfigurableBeanFactory',
  { implements: [HierarchicalBeanFactory, SingletonBeanRegistry] },
);
