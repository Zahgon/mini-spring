/**
 * `cn.hutool.core.util.ClassUtil`: public-method lookup and annotation-driven
 * package scanning.
 *
 * Hutool scans compiled `.class` files under a package on the classpath. The
 * TypeScript analogue is the registry every {@link Reflectable} class enters
 * when its module is evaluated — a class exists once it has been loaded, which
 * is exactly the condition a classloader enforces too.
 */

import {
  type AnnotationType,
  type JavaClass,
  type JavaMethod,
  registeredClasses,
} from '../java/lang/Class.js';

export const ClassUtil = {
  /** `getPublicMethod(Class, String)`; `null` when there is no such method. */
  getPublicMethod(type: JavaClass, methodName: string): JavaMethod | null {
    return type.getMethod(methodName);
  },

  /**
   * `scanPackageByAnnotation(basePackage, annotationClass)` — the package and
   * all of its sub-packages, filtered by a directly present annotation.
   */
  scanPackageByAnnotation(basePackage: string, annotation: AnnotationType): JavaClass[] {
    const prefix = `${basePackage}.`;
    return registeredClasses().filter(
      (type) =>
        !type.isInterface() &&
        !type.isPrimitive() &&
        type.getName().startsWith(prefix) &&
        type.getAnnotation(annotation) !== null,
    );
  },
} as const;
