/**
 * `ClassLoader.getResourceAsStream(path)`.
 *
 * Maven put `src/main/resources` and `src/test/resources` on the classpath;
 * the TypeScript equivalent is an explicit list of resource roots, searched in
 * registration order exactly as a classpath is.
 */

import { readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { ByteArrayInputStream, type InputStream } from '../io/InputStream.js';

const roots: string[] = [];

export const ClassLoader = {
  /** Adds a directory to the resource classpath. */
  addResourceRoot(root: string): void {
    const absolute = isAbsolute(root) ? root : resolve(process.cwd(), root);
    if (!roots.includes(absolute)) {
      roots.push(absolute);
    }
  },

  getResourceAsStream(path: string): InputStream | null {
    for (const root of roots) {
      try {
        return new ByteArrayInputStream(readFileSync(join(root, path)));
      } catch {
        // Not under this root; try the next one, as a classloader would.
      }
    }
    return null;
  },
} as const;
