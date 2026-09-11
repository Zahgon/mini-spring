import { declareInterface, type JavaClass } from '../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
export interface ClassFilter {
  matches(clazz: JavaClass): boolean;
}

export const ClassFilter = declareInterface('org.springframework.aop.ClassFilter');
