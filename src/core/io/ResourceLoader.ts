import { declareInterface } from '../../deps/java/lang/Class.js';
import type { Resource } from './Resource.js';

/**
 * Resource loader interface
 *
 * @author derekyi
 * @date 2020/11/25
 */
export interface ResourceLoader {
  getResource(location: string): Resource;
}

export const ResourceLoader = declareInterface('org.springframework.core.io.ResourceLoader');
