import { declareInterface, type TypeRef } from '../../deps/java/lang/Class.js';

/**
 * Type conversion abstraction
 *
 * @author derekyi
 * @date 2021/1/10
 */
export interface ConversionService {
  canConvert(sourceType: TypeRef, targetType: TypeRef): boolean;

  convert<T>(source: unknown, targetType: TypeRef): T;
}

export const ConversionService = declareInterface(
  'org.springframework.core.convert.ConversionService',
);
