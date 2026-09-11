/** `java.util.EventObject`. */

import { IllegalArgumentException } from '../lang/Exceptions.js';

export abstract class EventObject {
  protected source: object;

  constructor(source: object) {
    if (source === null || source === undefined) {
      throw new IllegalArgumentException('null source');
    }
    this.source = source;
  }

  getSource(): object {
    return this.source;
  }

  toString(): string {
    return `${this.constructor.name}[source=${String(this.source)}]`;
  }
}
