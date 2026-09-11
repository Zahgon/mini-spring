/**
 * `java.net.URL` and the blocking `URLConnection.getInputStream()`.
 *
 * Two Java behaviours are contract here:
 *
 *  - `new URL(spec)` throws `MalformedURLException` for an *unknown protocol*.
 *    `DefaultResourceLoader` relies on that to fall through to the filesystem
 *    branch for a plain path. The JavaScript `URL` constructor accepts any
 *    scheme, so the JDK's handler set is applied explicitly.
 *  - `getInputStream()` blocks. The container is synchronous end to end, so
 *    the request is performed in a child process and awaited synchronously,
 *    rather than leaking a Promise into the resource API.
 */

import { spawnSync } from 'node:child_process';
import { ByteArrayInputStream, type InputStream } from '../io/InputStream.js';
import { IOException } from '../io/IOExceptions.js';
import { JavaThrowable } from '../lang/Exceptions.js';

export class MalformedURLException extends JavaThrowable {}

/** The protocols the JDK ships a stream handler for. */
const KNOWN_PROTOCOLS = new Set(['http', 'https', 'file', 'ftp', 'jar', 'mailto', 'netdoc']);

const FETCH_SCRIPT = `
const url = process.argv[1];
fetch(url, { redirect: 'follow' })
  .then(async (response) => {
    if (response.status >= 400) {
      process.stderr.write('Server returned HTTP response code: ' + response.status + ' for URL: ' + url);
      process.exit(2);
    }
    process.stdout.write(Buffer.from(await response.arrayBuffer()));
  })
  .catch((error) => {
    process.stderr.write(String(error && error.message ? error.message : error));
    process.exit(1);
  });
`;

export class URLConnection {
  constructor(private readonly url: JavaURL) {}

  getInputStream(): InputStream {
    const result = spawnSync(process.execPath, ['-e', FETCH_SCRIPT, this.url.toString()], {
      maxBuffer: 64 * 1024 * 1024,
      encoding: 'buffer',
    });
    if (result.error !== undefined) {
      throw new IOException(result.error.message, result.error);
    }
    if (result.status !== 0) {
      throw new IOException(result.stderr.toString('utf8'));
    }
    return new ByteArrayInputStream(result.stdout);
  }
}

export class JavaURL {
  private constructor(private readonly spec: string) {}

  /** `new URL(spec)`. */
  static parse(spec: string): JavaURL {
    let parsed: URL;
    try {
      parsed = new URL(spec);
    } catch {
      throw new MalformedURLException(`no protocol: ${spec}`);
    }
    const protocol = parsed.protocol.slice(0, -1);
    if (!KNOWN_PROTOCOLS.has(protocol)) {
      throw new MalformedURLException(`unknown protocol: ${protocol}`);
    }
    return new JavaURL(spec);
  }

  openConnection(): URLConnection {
    return new URLConnection(this);
  }

  toString(): string {
    return this.spec;
  }
}
