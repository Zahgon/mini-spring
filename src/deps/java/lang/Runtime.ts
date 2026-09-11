/**
 * `Runtime.getRuntime().addShutdownHook(...)`.
 *
 * A JVM shutdown hook runs on normal exit; the Node equivalent is a
 * `process.on('exit')` listener, which is likewise synchronous and likewise
 * the last thing to run.
 */

export interface ShutdownHook {
  run(): void;
}

export const Runtime = {
  getRuntime() {
    return {
      addShutdownHook(hook: ShutdownHook): void {
        process.once('exit', () => {
          hook.run();
        });
      },
    };
  },
} as const;
