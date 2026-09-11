/**
 * `cn.hutool.core.bean.BeanUtil.setFieldValue`.
 *
 * Hutool writes the *field* reflectively, bypassing any setter — the container
 * never calls `setBrand(...)`. In TypeScript a declared field is an own data
 * property, so a direct assignment is the same operation.
 */

export const BeanUtil = {
  setFieldValue(bean: object, fieldName: string, value: unknown): void {
    (bean as Record<string, unknown>)[fieldName] = value;
  },
} as const;
