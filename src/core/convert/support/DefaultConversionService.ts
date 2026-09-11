import { Reflectable } from '../../../deps/java/lang/Class.js';
import { ConversionService } from '../ConversionService.js';
import { ConverterRegistry } from '../converter/ConverterRegistry.js';
import { GenericConversionService } from './GenericConversionService.js';
import { StringToNumberConverterFactory } from './StringToNumberConverterFactory.js';

/**
 * @author derekyi
 * @date 2021/1/16
 */
@Reflectable('org.springframework.core.convert.support.DefaultConversionService', {
  implements: [ConversionService, ConverterRegistry],
})
export class DefaultConversionService extends GenericConversionService {
  constructor() {
    super();
    DefaultConversionService.addDefaultConverters(this);
  }

  static addDefaultConverters(converterRegistry: ConverterRegistry): void {
    converterRegistry.addConverterFactory(new StringToNumberConverterFactory());
    // TODO add the other ConverterFactory
  }
}
