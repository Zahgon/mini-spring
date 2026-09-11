/** The `java.lang.System` members mini-spring uses. */

export const System = {
  currentTimeMillis(): number {
    return Date.now();
  },

  out: {
    println(value: unknown = ''): void {
      // eslint-disable-next-line no-console
      console.log(typeof value === 'string' ? value : String(value));
    },
  },
} as const;
