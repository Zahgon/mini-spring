import {
  Boolean_,
  ConvertiblePair,
  GenericConverter as GenericConverterType,
  Reflectable,
  Types,
  type GenericConverter,
  type JavaClass,
} from '../../src/index.js';

/**
 * @author derekyi
 * @date 2021/1/16
 */
@Reflectable('org.springframework.test.common.StringToBooleanConverter', {
  implements: [GenericConverterType],
})
export class StringToBooleanConverter implements GenericConverter {
  getConvertibleTypes(): Set<ConvertiblePair> {
    return new Set([new ConvertiblePair(Types.String, Types.Boolean)]);
  }

  convert(source: unknown, _sourceType: JavaClass, _targetType: JavaClass): unknown {
    return Boolean_.valueOf(source as string);
  }
}
