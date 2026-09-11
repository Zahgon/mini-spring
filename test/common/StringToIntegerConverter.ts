import {
  Converter as ConverterType,
  Integer,
  Reflectable,
  Types,
  type Converter,
} from '../../src/index.js';

/**
 * @author derekyi
 * @date 2021/1/16
 */
@Reflectable('org.springframework.test.common.StringToIntegerConverter', {
  implements: [ConverterType.of(Types.String, Types.Integer)],
})
export class StringToIntegerConverter implements Converter<string, number> {
  convert(source: string): number {
    return Integer.valueOf(source);
  }
}
