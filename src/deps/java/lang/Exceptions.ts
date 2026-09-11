/**
 * The handful of `java.lang` / `java.io` throwables whose *type* or *message*
 * the container treats as contract.
 *
 * Java's `Throwable(String, Throwable)` chaining is reproduced with the ES2022
 * `cause` option so that a wrapped failure keeps its origin.
 */

export class JavaThrowable extends Error {
  constructor(message?: string | undefined, cause?: unknown) {
    super(message ?? undefined, cause === undefined ? undefined : { cause });
    this.name = new.target.name;
  }

  /** Mirrors {@code Throwable#getMessage()}: {@code null} when absent. */
  getMessage(): string | null {
    return this.message === '' ? null : this.message;
  }

  getCause(): unknown {
    return this.cause;
  }
}

export class RuntimeException extends JavaThrowable {}

export class IllegalArgumentException extends RuntimeException {}

export class NumberFormatException extends IllegalArgumentException {}

export class ClassNotFoundException extends JavaThrowable {}

export class NoSuchMethodException extends JavaThrowable {}

export class NoSuchFieldException extends JavaThrowable {}
