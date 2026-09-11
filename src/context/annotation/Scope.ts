import { defineAnnotation } from '../../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/12/26
 */
export interface ScopeAttributes {
  readonly value: string;
}

const ScopeAnnotation = defineAnnotation<ScopeAttributes>(
  'org.springframework.context.annotation.Scope',
);

/** `@Target({TYPE, METHOD}) @Retention(RUNTIME) @interface Scope { String value() default "singleton"; }` */
export function Scope(value = 'singleton'): ClassDecorator {
  return ScopeAnnotation({ value });
}
Scope.annotationType = ScopeAnnotation;
