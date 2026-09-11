/**
 * @author derekyi
 * @date 2021/1/16
 */
import { expect, test } from 'vitest';
import {
  GenericConversionService,
  StringToNumberConverterFactory,
  Types,
  type Converter,
} from '../../src/index.js';
import { StringToBooleanConverter } from '../common/StringToBooleanConverter.js';
import { StringToIntegerConverter } from '../common/StringToIntegerConverter.js';

test('testStringToIntegerConverter', () => {
  const converter = new StringToIntegerConverter();
  const num = converter.convert('8888');
  expect(num).toEqual(8888);
});

test('testStringToNumberConverterFactory', () => {
  const converterFactory = new StringToNumberConverterFactory();

  const stringToIntegerConverter: Converter<string, number> =
    converterFactory.getConverter(Types.Integer);
  const intNum = stringToIntegerConverter.convert('8888');
  expect(intNum).toEqual(8888);

  const stringToLongConverter: Converter<string, bigint> =
    converterFactory.getConverter(Types.Long);
  const longNum = stringToLongConverter.convert('8888');
  expect(longNum).toEqual(8888n);
});

test('testGenericConverter', () => {
  const converter = new StringToBooleanConverter();

  const flag = converter.convert('true', Types.String, Types.Boolean) as boolean;
  expect(flag).toBe(true);
});

test('testGenericConversionService', () => {
  const conversionService = new GenericConversionService();
  conversionService.addConverter(new StringToIntegerConverter());

  const intNum = conversionService.convert<number>('8888', Types.Integer);
  expect(conversionService.canConvert(Types.String, Types.Integer)).toBe(true);
  expect(intNum).toEqual(8888);

  conversionService.addConverterFactory(new StringToNumberConverterFactory());
  expect(conversionService.canConvert(Types.String, Types.Long)).toBe(true);
  const longNum = conversionService.convert<bigint>('8888', Types.Long);
  expect(longNum).toEqual(8888n);

  conversionService.addConverter(new StringToBooleanConverter());
  expect(conversionService.canConvert(Types.String, Types.Boolean)).toBe(true);
  const flag = conversionService.convert<boolean>('true', Types.Boolean);
  expect(flag).toBe(true);
});
