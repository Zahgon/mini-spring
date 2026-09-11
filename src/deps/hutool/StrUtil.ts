/** The `cn.hutool.core.util.StrUtil` members mini-spring uses. */

export const StrUtil = {
  EMPTY: '',

  isEmpty(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.length === 0;
  },

  isNotEmpty(value: string | null | undefined): value is string {
    return !StrUtil.isEmpty(value);
  },

  /** Lower-cases the first character; the empty string is returned unchanged. */
  lowerFirst(value: string): string {
    return value.length === 0 ? value : value.charAt(0).toLowerCase() + value.slice(1);
  },

  /** `splitToArray(str, char)`: no trimming, empty segments kept. */
  splitToArray(value: string, separator: string): string[] {
    return value.split(separator);
  },
} as const;
