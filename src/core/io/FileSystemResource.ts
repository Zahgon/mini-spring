import { readFileSync } from 'node:fs';
import { Reflectable } from '../../deps/java/lang/Class.js';
import { FileNotFoundException } from '../../deps/java/io/IOExceptions.js';
import { ByteArrayInputStream, type InputStream } from '../../deps/java/io/InputStream.js';
import { Resource } from './Resource.js';

/**
 * @author derekyi
 * @date 2020/11/25
 */
@Reflectable('org.springframework.core.io.FileSystemResource', { implements: [Resource] })
export class FileSystemResource implements Resource {
  constructor(private readonly filePath: string) {}

  getInputStream(): InputStream {
    try {
      return new ByteArrayInputStream(readFileSync(this.filePath));
    } catch (error) {
      // Files.newInputStream raises NoSuchFileException, which the original
      // rethrows as FileNotFoundException.
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new FileNotFoundException(this.filePath, error);
      }
      throw error;
    }
  }

  toString(): string {
    return `file [${this.filePath}]`;
  }
}
