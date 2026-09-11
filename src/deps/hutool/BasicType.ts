/** `cn.hutool.core.convert.BasicType.wrap`: the primitive-to-wrapper map. */

import type { JavaClass } from '../java/lang/Class.js';

export const BasicType = {
  wrap(type: JavaClass): JavaClass {
    return type.wrapperType ?? type;
  },
} as const;
