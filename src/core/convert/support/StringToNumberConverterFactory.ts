import { asClass, Reflectable, type TypeRef, Types } from '../../../deps/java/lang/Class.js';
import { IllegalArgumentException } from '../../../deps/java/lang/Exceptions.js';
import { Integer, Long } from '../../../deps/java/lang/Boxed.js';
import type { Converter } from '../converter/Converter.js';
import { ConverterFactory } from '../converter/ConverterFactory.js';

/**
 * `java.lang.Long` is 64-bit, so it is carried as a `bigint`; `java.lang.Integer`
 * fits a `number` exactly.
 */
export type JavaNumber = number | bigint;

/**
 * @author derekyi
 * @date 2021/1/10
 */
@Reflectable('org.springframework.core.convert.support.StringToNumberConverterFactory', {
  implements: [ConverterFactory.of(Types.String, Types.Number)],
})
export class StringToNumberConverterFactory implements ConverterFactory<string, JavaNumber> {
  getConverter<T extends JavaNumber>(targetType: TypeRef): Converter<string, T> {
    return new StringToNumber<T>(targetType);
  }
}

class StringToNumber<T extends JavaNumber> implements Converter<string, T> {
  constructor(private readonly targetType: TypeRef) {}

  convert(source: string): T {
    if (source.length === 0) {
      return null as unknown as T;
    }

    const targetType = asClass(this.targetType);
    if (targetType === Types.Integer) {
      return Integer.valueOf(source) as T;
    } else if (targetType === Types.Long) {
      return Long.valueOf(source) as T;
    }
    // TODO other number types
    else {
      throw new IllegalArgumentException(
        `Cannot convert String [${source}] to target class [${targetType.getName()}]`,
      );
    }
  }
}
