import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // The Java test classpath contained src/test/resources and every compiled
    // test class. TypeScript has no classpath: a class only exists once its
    // module has been evaluated, so the equivalent set-up is loaded here.
    setupFiles: ['test/setup/classpath.ts'],
    globals: false,
    // The suite performs real network I/O and a one-second sleep; Surefire
    // imposed no per-test deadline either.
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'json-summary', 'lcov'],
    },
  },
});
