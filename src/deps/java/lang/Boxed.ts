/**
 * `Integer.valueOf`, `Long.valueOf` and `Boolean.parseBoolean`, reproduced
 * because the conversion service and the XML reader depend on their exact
 * acceptance rules and on the text of `NumberFormatException`.
 *
 * `Long` maps to `bigint`, not `number`: `java.lang.Long` is 64-bit, and
 * rounding it into a double would silently change values above 2^53.
 */

import { NumberFormatException } from './Exceptions.js';

const INTEGER_MIN = -2147483648n;
const INTEGER_MAX = 2147483647n;
const LONG_MIN = -(2n ** 63n);
const LONG_MAX = 2n ** 63n - 1n;

/** `Integer.parseInt` / `Long.parseLong` grammar: an optional sign, then digits. */
function parseSignedDecimal(source: string): bigint {
  if (source.length === 0 || !/^[+-]?[0-9]+$/.test(source)) {
    throw new NumberFormatException(`For input string: "${source}"`);
  }
  return BigInt(source);
}

export const Integer = {
  valueOf(source: string): number {
    const value = parseSignedDecimal(source);
    if (value < INTEGER_MIN || value > INTEGER_MAX) {
      throw new NumberFormatException(`For input string: "${source}"`);
    }
    return Number(value);
  },
} as const;

export const Long = {
  valueOf(source: string): bigint {
    const value = parseSignedDecimal(source);
    if (value < LONG_MIN || value > LONG_MAX) {
      throw new NumberFormatException(`For input string: "${source}"`);
    }
    return value;
  },
} as const;

export const Boolean_ = {
  /** `Boolean.parseBoolean`: case-insensitive "true", everything else false. */
  parseBoolean(source: string | null | undefined): boolean {
    return source !== null && source !== undefined && source.toLowerCase() === 'true';
  },

  /** `Boolean.valueOf(String)`, which has the same rule. */
  valueOf(source: string | null | undefined): boolean {
    return Boolean_.parseBoolean(source);
  },
} as const;

/**
 * `String.valueOf(Object)` — how Java renders a value spliced into a string.
 * Notably `null` renders as `null`, which several `toString()` contracts rely on.
 */
export function stringValueOf(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return `[${value.map((element) => stringValueOf(element)).join(', ')}]`;
  }
  return String(value);
}
