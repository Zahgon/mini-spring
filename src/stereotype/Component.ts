import { defineAnnotation } from '../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/12/26
 */
export interface ComponentAttributes {
  readonly value: string;
}

const ComponentAnnotation = defineAnnotation<ComponentAttributes>(
  'org.springframework.stereotype.Component',
);

/** `@Target(TYPE) @Retention(RUNTIME) @interface Component { String value() default ""; }` */
export function Component(value = ''): ClassDecorator {
  return ComponentAnnotation({ value });
}
Component.annotationType = ComponentAnnotation;
