import { defineAnnotation } from '../../../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/12/27
 */
export interface ValueAttributes {
  readonly value: string;
}

const ValueAnnotation = defineAnnotation<ValueAttributes>(
  'org.springframework.beans.factory.annotation.Value',
);

/** `@Retention(RUNTIME) @Target({FIELD, METHOD, PARAMETER}) @interface Value { String value(); }` */
export function Value(value: string): PropertyDecorator {
  return ValueAnnotation({ value });
}
Value.annotationType = ValueAnnotation;
