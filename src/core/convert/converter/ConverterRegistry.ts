import { declareInterface } from '../../../deps/java/lang/Class.js';
import type { ErasedConverter } from './Converter.js';
import type { ErasedConverterFactory } from './ConverterFactory.js';
import type { GenericConverter } from './GenericConverter.js';

/**
 * Converter registration interface
 *
 * @author derekyi
 * @date 2021/1/10
 */
export interface ConverterRegistry {
  addConverter(converter: ErasedConverter | GenericConverter): void;

  addConverterFactory(converterFactory: ErasedConverterFactory): void;
}

export const ConverterRegistry = declareInterface(
  'org.springframework.core.convert.converter.ConverterRegistry',
);
