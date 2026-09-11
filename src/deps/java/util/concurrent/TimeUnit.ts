/**
 * `java.util.concurrent.TimeUnit`, reduced to the blocking `sleep` the test
 * suite uses.
 *
 * `Thread.sleep` blocks; `setTimeout` does not. Turning the caller
 * asynchronous would change what the surrounding code observes, so the wait is
 * performed with `Atomics.wait`, which blocks the thread the way Java does.
 */

function sleepMillis(millis: number): void {
  if (millis <= 0) {
    return;
  }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, millis);
}

export class TimeUnitValue {
  constructor(private readonly millisPerUnit: number) {}

  sleep(timeout: number): void {
    sleepMillis(timeout * this.millisPerUnit);
  }

  toMillis(duration: number): number {
    return duration * this.millisPerUnit;
  }
}

export const TimeUnit = {
  MILLISECONDS: new TimeUnitValue(1),
  SECONDS: new TimeUnitValue(1000),
  MINUTES: new TimeUnitValue(60_000),
} as const;
