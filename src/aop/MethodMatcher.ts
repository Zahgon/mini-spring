import { declareInterface, type JavaClass, type JavaMethod } from '../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
export interface MethodMatcher {
  matches(method: JavaMethod, targetClass: JavaClass): boolean;
}

export const MethodMatcher = declareInterface('org.springframework.aop.MethodMatcher');
