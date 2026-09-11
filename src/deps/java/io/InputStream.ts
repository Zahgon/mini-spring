/**
 * `java.io.InputStream`, reduced to the synchronous byte source the container
 * actually needs.
 *
 * It stays **synchronous** deliberately. `Resource.getInputStream()` is called
 * from inside `new ClassPathXmlApplicationContext(...)`, so making it a Promise
 * would turn the whole public API asynchronous — a change to the contract, not
 * a translation of it.
 */

export abstract class InputStream {
  abstract readAllBytes(): Buffer;

  close(): void {
    // Nothing to release: every stream here is already fully buffered.
  }
}

export class ByteArrayInputStream extends InputStream {
  constructor(private readonly bytes: Buffer) {
    super();
  }

  override readAllBytes(): Buffer {
    return this.bytes;
  }
}
