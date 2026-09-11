/**
 * `java.util.Properties`, restricted to `load(InputStream)` and
 * `getProperty(String)`.
 *
 * The `.properties` format is a specified wire format — comments, the three
 * key/value separators, continuation lines and backslash escapes — so it is
 * reproduced rather than approximated with an ad-hoc `split('=')`.
 */

import type { InputStream } from '../io/InputStream.js';

export class Properties {
  private readonly values = new Map<string, string>();

  load(inputStream: InputStream): void {
    // Properties.load(InputStream) decodes as ISO-8859-1.
    this.loadFromText(inputStream.readAllBytes().toString('latin1'));
  }

  getProperty(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setProperty(key: string, value: string): void {
    this.values.set(key, value);
  }

  private loadFromText(text: string): void {
    for (const logicalLine of logicalLines(text)) {
      const line = logicalLine.replace(/^[ \t\f]+/, '');
      if (line.length === 0 || line.startsWith('#') || line.startsWith('!')) {
        continue;
      }
      const { key, value } = splitKeyValue(line);
      this.values.set(unescape(key), unescape(value));
    }
  }
}

/** Joins continuation lines: a line ending in an odd number of backslashes. */
function* logicalLines(text: string): Generator<string> {
  let pending = '';
  for (const rawLine of text.split(/\r\n|\n|\r/)) {
    const line = pending === '' ? rawLine : pending + rawLine.replace(/^[ \t\f]+/, '');
    if (endsWithOddBackslashes(line)) {
      pending = line.slice(0, -1);
      continue;
    }
    pending = '';
    yield line;
  }
  if (pending !== '') {
    yield pending;
  }
}

function endsWithOddBackslashes(line: string): boolean {
  let count = 0;
  for (let i = line.length - 1; i >= 0 && line[i] === '\\'; i--) {
    count++;
  }
  return count % 2 === 1;
}

function splitKeyValue(line: string): { key: string; value: string } {
  let index = 0;
  for (; index < line.length; index++) {
    const character = line[index]!;
    if (character === '\\') {
      index++;
      continue;
    }
    if (character === '=' || character === ':' || ' \t\f'.includes(character)) {
      break;
    }
  }
  const key = line.slice(0, index);
  let rest = line.slice(index).replace(/^[ \t\f]+/, '');
  if (rest.startsWith('=') || rest.startsWith(':')) {
    rest = rest.slice(1).replace(/^[ \t\f]+/, '');
  }
  return { key, value: rest };
}

function unescape(value: string): string {
  let result = '';
  for (let i = 0; i < value.length; i++) {
    const character = value[i]!;
    if (character !== '\\') {
      result += character;
      continue;
    }
    const escaped = value[++i];
    switch (escaped) {
      case 't':
        result += '\t';
        break;
      case 'n':
        result += '\n';
        break;
      case 'r':
        result += '\r';
        break;
      case 'f':
        result += '\f';
        break;
      case 'u':
        result += String.fromCharCode(Number.parseInt(value.slice(i + 1, i + 5), 16));
        i += 4;
        break;
      case undefined:
        break;
      default:
        result += escaped;
    }
  }
  return result;
}
