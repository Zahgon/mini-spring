import { declareInterface } from '../deps/java/lang/Class.js';
import type { ClassFilter } from './ClassFilter.js';
import type { MethodMatcher } from './MethodMatcher.js';

/**
 * Pointcut abstraction
 *
 * @author derekyi
 * @date 2020/12/5
 */
export interface Pointcut {
  getClassFilter(): ClassFilter;

  getMethodMatcher(): MethodMatcher;
}

export const Pointcut = declareInterface('org.springframework.aop.Pointcut');
