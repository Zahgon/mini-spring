/**
 * Captures what a block of code writes to standard output, and lets it through.
 *
 * Six of the ported suites are smoke tests in the original: they drive the
 * container and print, and assert nothing, so each would still pass with the
 * advice chain removed entirely. They assert their output here instead. The
 * writes are forwarded to the real console as well as recorded, so the output
 * the suites produce is unchanged and stays comparable, line for line, with the
 * Java original.
 */
export function recordOutput(body: () => void): string[] {
  const lines: string[] = [];
  const original = console.log;
  console.log = (...args: unknown[]): void => {
    lines.push(args.map((arg) => String(arg)).join(' '));
    original(...args);
  };
  try {
    body();
  } finally {
    console.log = original;
  }
  return lines;
}
