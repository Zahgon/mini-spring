import { Reflectable } from '../../deps/java/lang/Class.js';
import { JavaURL, MalformedURLException } from '../../deps/java/net/URL.js';
import { ClassPathResource } from './ClassPathResource.js';
import { FileSystemResource } from './FileSystemResource.js';
import type { Resource } from './Resource.js';
import { ResourceLoader } from './ResourceLoader.js';
import { UrlResource } from './UrlResource.js';

/**
 * @author derekyi
 * @date 2020/11/25
 */
@Reflectable('org.springframework.core.io.DefaultResourceLoader', { implements: [ResourceLoader] })
export class DefaultResourceLoader implements ResourceLoader {
  static readonly CLASSPATH_URL_PREFIX = 'classpath:';

  getResource(location: string): Resource {
    if (location.startsWith(DefaultResourceLoader.CLASSPATH_URL_PREFIX)) {
      // a resource on the classpath
      return new ClassPathResource(
        location.substring(DefaultResourceLoader.CLASSPATH_URL_PREFIX.length),
      );
    }
    try {
      // try to treat it as a URL
      const url = JavaURL.parse(location);
      return new UrlResource(url);
    } catch (ex) {
      if (!(ex instanceof MalformedURLException)) {
        throw ex;
      }
      // treat it as a resource on the file system
      return new FileSystemResource(location);
    }
  }
}
