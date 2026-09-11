import { declareInterface } from '../../../deps/java/lang/Class.js';

/**
 * Type conversion abstraction
 *
 * @author derekyi
 * @date 2021/1/10
 */
export interface Converter<S, T> {
  convert(source: S): T;
}

/** A `Converter` whose type arguments have been erased, as the registry sees it. */
export interface ErasedConverter {
  convert(source: never): unknown;
}

export const Converter = declareInterface(
  'org.springframework.core.convert.converter.Converter',
);
