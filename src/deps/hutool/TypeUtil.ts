/**
 * `cn.hutool.core.util.TypeUtil`, i.e. "what is the declared type of this
 * field?" — the single piece of information TypeScript erases most completely.
 * It is answered from the field types declared to {@link Reflectable}.
 */

import type { JavaClass, JavaField } from '../java/lang/Class.js';

export const TypeUtil = {
  /** `TypeUtil.getType(Field)`. */
  getType(field: JavaField): JavaClass {
    return field.getType();
  },

  /** `TypeUtil.getFieldType(Class, String)`; `null` when the field is unknown. */
  getFieldType(type: JavaClass, fieldName: string): JavaClass | null {
    for (let current: JavaClass | null = type; current !== null; current = current.getSuperclass()) {
      const field = current.getDeclaredField(fieldName);
      if (field !== null) {
        return field.getType();
      }
    }
    return null;
  },
} as const;
