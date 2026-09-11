import { declareInterface, type TypeRef } from '../../../deps/java/lang/Class.js';
import type { Converter, ErasedConverter } from './Converter.js';

/**
 * Type conversion factory
 *
 * @author derekyi
 * @date 2021/1/10
 */
export interface ConverterFactory<S, R> {
  getConverter<T extends R>(targetType: TypeRef): Converter<S, T>;
}

/** A `ConverterFactory` whose type arguments have been erased. */
export interface ErasedConverterFactory {
  getConverter(targetType: TypeRef): ErasedConverter;
}

export const ConverterFactory = declareInterface(
  'org.springframework.core.convert.converter.ConverterFactory',
);
