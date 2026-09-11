import { Reflectable } from '../../deps/java/lang/Class.js';
import { IllegalArgumentException } from '../../deps/java/lang/Exceptions.js';
import { FactoryBean } from '../../beans/factory/FactoryBean.js';
import { InitializingBean } from '../../beans/factory/InitializingBean.js';
import { ConversionService } from '../../core/convert/ConversionService.js';
import { Converter, type ErasedConverter } from '../../core/convert/converter/Converter.js';
import { ConverterFactory, type ErasedConverterFactory } from '../../core/convert/converter/ConverterFactory.js';
import type { ConverterRegistry } from '../../core/convert/converter/ConverterRegistry.js';
import { GenericConverter } from '../../core/convert/converter/GenericConverter.js';
import { DefaultConversionService } from '../../core/convert/support/DefaultConversionService.js';
import type { GenericConversionService } from '../../core/convert/support/GenericConversionService.js';

/**
 * @author derekyi
 * @date 2021/1/17
 */
@Reflectable('org.springframework.context.support.ConversionServiceFactoryBean', {
  implements: [FactoryBean.of(ConversionService), InitializingBean],
})
export class ConversionServiceFactoryBean
  implements FactoryBean<ConversionService>, InitializingBean
{
  private converters: Set<unknown> | null = null;

  private conversionService!: GenericConversionService;

  afterPropertiesSet(): void {
    this.conversionService = new DefaultConversionService();
    this.registerConverters(this.converters, this.conversionService);
  }

  private registerConverters(converters: Set<unknown> | null, registry: ConverterRegistry): void {
    if (converters !== null) {
      for (const converter of converters) {
        if (GenericConverter.isInstance(converter)) {
          registry.addConverter(converter as GenericConverter);
        } else if (Converter.isInstance(converter)) {
          registry.addConverter(converter as ErasedConverter);
        } else if (ConverterFactory.isInstance(converter)) {
          registry.addConverterFactory(converter as ErasedConverterFactory);
        } else {
          throw new IllegalArgumentException(
            'Each converter object must implement one of the ' +
              'Converter, ConverterFactory, or GenericConverter interfaces',
          );
        }
      }
    }
  }

  getObject(): ConversionService {
    return this.conversionService;
  }

  isSingleton(): boolean {
    return true;
  }

  setConverters(converters: Set<unknown>): void {
    this.converters = converters;
  }
}
