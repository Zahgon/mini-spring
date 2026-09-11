import { defineAnnotation } from '../../../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/12/27
 */
export interface QualifierAttributes {
  readonly value: string;
}

const QualifierAnnotation = defineAnnotation<QualifierAttributes>(
  'org.springframework.beans.factory.annotation.Qualifier',
);

/** `@Retention(RUNTIME) @Inherited @Documented @interface Qualifier { String value() default ""; }` */
export function Qualifier(value = ''): ClassDecorator & PropertyDecorator {
  return QualifierAnnotation({ value });
}
Qualifier.annotationType = QualifierAnnotation;
