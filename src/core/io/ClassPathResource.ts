import { Reflectable } from '../../deps/java/lang/Class.js';
import { ClassLoader } from '../../deps/java/lang/ClassLoader.js';
import { FileNotFoundException } from '../../deps/java/io/IOExceptions.js';
import type { InputStream } from '../../deps/java/io/InputStream.js';
import { Resource } from './Resource.js';

/**
 * A resource on the classpath
 *
 * @author derekyi
 * @date 2020/11/25
 */
@Reflectable('org.springframework.core.io.ClassPathResource', { implements: [Resource] })
export class ClassPathResource implements Resource {
  constructor(private readonly path: string) {}

  getInputStream(): InputStream {
    const is = ClassLoader.getResourceAsStream(this.path);
    if (is === null) {
      throw new FileNotFoundException(`${this.path} cannot be opened because it does not exist`);
    }
    return is;
  }

  toString(): string {
    return `class path resource [${this.path}]`;
  }
}
