/** `cn.hutool.core.io.IoUtil.readUtf8`. */

import type { InputStream } from '../java/io/InputStream.js';

export const IoUtil = {
  readUtf8(inputStream: InputStream): string {
    return inputStream.readAllBytes().toString('utf8');
  },
} as const;
