import { defineAnnotation } from '../../../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/12/27
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AutowiredAttributes {}

const AutowiredAnnotation = defineAnnotation<AutowiredAttributes>(
  'org.springframework.beans.factory.annotation.Autowired',
);

/** `@Retention(RUNTIME) @Target({CONSTRUCTOR, FIELD, METHOD}) @interface Autowired {}` */
export function Autowired(): PropertyDecorator {
  return AutowiredAnnotation({});
}
Autowired.annotationType = AutowiredAnnotation;
