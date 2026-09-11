import { declareInterface } from '../../deps/java/lang/Class.js';
import type { InputStream } from '../../deps/java/io/InputStream.js';

/**
 * Abstraction over, and access to, a resource
 *
 * @author derekyi
 * @date 2020/11/25
 */
export interface Resource {
  getInputStream(): InputStream;
}

export const Resource = declareInterface('org.springframework.core.io.Resource');
