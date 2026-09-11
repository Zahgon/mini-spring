import { Reflectable } from '../../deps/java/lang/Class.js';
import type { InputStream } from '../../deps/java/io/InputStream.js';
import type { JavaURL } from '../../deps/java/net/URL.js';
import { Resource } from './Resource.js';

/**
 * @author derekyi
 * @date 2020/11/25
 */
@Reflectable('org.springframework.core.io.UrlResource', { implements: [Resource] })
export class UrlResource implements Resource {
  constructor(private readonly url: JavaURL) {}

  getInputStream(): InputStream {
    const con = this.url.openConnection();
    return con.getInputStream();
  }

  toString(): string {
    return `URL [${this.url.toString()}]`;
  }
}
