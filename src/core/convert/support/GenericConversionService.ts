import {
  asClass,
  JavaParameterizedType,
  Reflectable,
  type JavaClass,
  type TypeRef,
} from '../../../deps/java/lang/Class.js';
import { getClass } from '../../../deps/java/lang/Class.js';
import { JavaHashMap } from '../../../deps/java/util/HashMap.js';
import { BasicType } from '../../../deps/hutool/BasicType.js';
import { ConversionService } from '../ConversionService.js';
import type { ErasedConverter } from '../converter/Converter.js';
import type { ErasedConverterFactory } from '../converter/ConverterFactory.js';
import { ConverterRegistry } from '../converter/ConverterRegistry.js';
import { ConvertiblePair, GenericConverter } from '../converter/GenericConverter.js';

/**
 * @author derekyi
 * @date 2021/1/16
 */
@Reflectable('org.springframework.core.convert.support.GenericConversionService', {
  implements: [ConversionService, ConverterRegistry],
})
export class GenericConversionService implements ConversionService, ConverterRegistry {
  private readonly converters = new JavaHashMap<ConvertiblePair, GenericConverter>();

  canConvert(sourceType: TypeRef, targetType: TypeRef): boolean {
    const converter = this.getConverter(asClass(sourceType), asClass(targetType));
    return converter !== null;
  }

  convert<T>(source: unknown, targetType: TypeRef): T {
    const sourceType = getClass(source as object);
    const resolvedTargetType = BasicType.wrap(asClass(targetType));
    const converter = this.getConverter(sourceType, resolvedTargetType);
    return converter!.convert(source, sourceType, resolvedTargetType) as T;
  }

  addConverter(converter: ErasedConverter | GenericConverter): void {
    if (isGenericConverter(converter)) {
      for (const convertibleType of converter.getConvertibleTypes()) {
        this.converters.put(convertibleType, converter);
      }
      return;
    }
    const typeInfo = getRequiredTypeInfo(converter);
    const converterAdapter = new ConverterAdapter(typeInfo, converter);
    for (const convertibleType of converterAdapter.getConvertibleTypes()) {
      this.converters.put(convertibleType, converterAdapter);
    }
  }

  addConverterFactory(converterFactory: ErasedConverterFactory): void {
    const typeInfo = getRequiredTypeInfo(converterFactory);
    const converterFactoryAdapter = new ConverterFactoryAdapter(typeInfo, converterFactory);
    for (const convertibleType of converterFactoryAdapter.getConvertibleTypes()) {
      this.converters.put(convertibleType, converterFactoryAdapter);
    }
  }

  protected getConverter(sourceType: JavaClass, targetType: JavaClass): GenericConverter | null {
    const sourceCandidates = getClassHierarchy(sourceType);
    const targetCandidates = getClassHierarchy(targetType);
    for (const sourceCandidate of sourceCandidates) {
      for (const targetCandidate of targetCandidates) {
        const convertiblePair = new ConvertiblePair(sourceCandidate, targetCandidate);
        const converter = this.converters.get(convertiblePair);
        if (converter !== undefined) {
          return converter;
        }
      }
    }
    return null;
  }
}

/**
 * Reads `<S, T>` off the object's first declared generic interface, exactly as
 * `getClass().getGenericInterfaces()[0]` does in the original.
 */
function getRequiredTypeInfo(object: object): ConvertiblePair {
  const types = getClass(object).getGenericInterfaces();
  const parameterized = types[0];
  if (!(parameterized instanceof JavaParameterizedType)) {
    throw new TypeError(
      `${getClass(object).getName()} does not declare the type arguments of its first interface`,
    );
  }
  const actualTypeArguments = parameterized.getActualTypeArguments();
  return new ConvertiblePair(actualTypeArguments[0]!, actualTypeArguments[1]!);
}

function getClassHierarchy(type: JavaClass): JavaClass[] {
  const hierarchy: JavaClass[] = [];
  // a primitive is widened to its wrapper
  let current: JavaClass | null = BasicType.wrap(type);
  while (current !== null) {
    hierarchy.push(current);
    current = current.getSuperclass();
  }
  return hierarchy;
}

function isGenericConverter(
  converter: ErasedConverter | GenericConverter,
): converter is GenericConverter {
  return GenericConverter.isInstance(converter);
}

class ConverterAdapter implements GenericConverter {
  constructor(
    private readonly typeInfo: ConvertiblePair,
    private readonly converter: ErasedConverter,
  ) {}

  getConvertibleTypes(): Iterable<ConvertiblePair> {
    return [this.typeInfo];
  }

  convert(source: unknown, _sourceType: JavaClass, _targetType: JavaClass): unknown {
    return this.converter.convert(source as never);
  }
}

class ConverterFactoryAdapter implements GenericConverter {
  constructor(
    private readonly typeInfo: ConvertiblePair,
    private readonly converterFactory: ErasedConverterFactory,
  ) {}

  getConvertibleTypes(): Iterable<ConvertiblePair> {
    return [this.typeInfo];
  }

  convert(source: unknown, _sourceType: JavaClass, targetType: JavaClass): unknown {
    return this.converterFactory.getConverter(targetType).convert(source as never);
  }
}
