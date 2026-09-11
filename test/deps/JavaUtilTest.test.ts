/**
 * `java.util.Properties` and `java.time.LocalDate`.
 *
 * The `.properties` format and `LocalDate`'s value semantics used to be the
 * JDK's; every expected value here was captured from OpenJDK 11.
 */

import { describe, expect, test } from 'vitest';
import {
  ByteArrayInputStream,
  DateTimeException,
  DateTimeFormatter,
  DateTimeParseException,
  LocalDate,
  Properties,
} from '../../src/index.js';

function load(text: string): Properties {
  const properties = new Properties();
  properties.load(new ByteArrayInputStream(Buffer.from(text, 'latin1')));
  return properties;
}

describe('PropertiesTest', () => {
  test('the fixture the repository actually ships', () => {
    expect(load('brand=lamborghini').getProperty('brand')).toEqual('lamborghini');
  });

  test('the three key/value separators', () => {
    const properties = load('a:1\nb 2\nc = 3 ');
    expect(properties.getProperty('a')).toEqual('1');
    expect(properties.getProperty('b')).toEqual('2');
    // trailing whitespace belongs to the value
    expect(properties.getProperty('c')).toEqual('3 ');
  });

  test('comments and blank lines are skipped', () => {
    const properties = load('# comment\n! bang\n\na=1');
    expect(properties.getProperty('a')).toEqual('1');
    expect(properties.getProperty('# comment')).toBeNull();
  });

  test('escapes in both the key and the value', () => {
    const properties = load('a\\:b=x\\ty\\nz\nk\\=1=v');
    expect(properties.getProperty('a:b')).toEqual('x\ty\nz');
    expect(properties.getProperty('k=1')).toEqual('v');
  });

  test('a trailing backslash continues the line, and the indent is dropped', () => {
    expect(load('a=one\\\n   two').getProperty('a')).toEqual('onetwo');
  });

  test('unicode escapes', () => {
    expect(load('a=\\u0041\\u00e9').getProperty('a')).toEqual('Aé');
  });

  test('a key with no separator has an empty value', () => {
    const properties = load('flag\nkey=');
    expect(properties.getProperty('flag')).toEqual('');
    expect(properties.getProperty('key')).toEqual('');
  });

  test('a repeated key keeps the last value', () => {
    expect(load('a=1\na=2').getProperty('a')).toEqual('2');
  });

  test('an absent key is null', () => {
    expect(load('a=1').getProperty('b')).toBeNull();
  });
});

describe('LocalDateTest', () => {
  const formatter = DateTimeFormatter.ofPattern('yyyy-MM-dd');

  test('parse and format round-trip through the repository pattern', () => {
    expect(LocalDate.parse('2021-01-01', formatter)).toEqual(LocalDate.of(2021, 1, 1));
    expect(formatter.format(LocalDate.of(7, 3, 4))).toEqual('0007-03-04');
  });

  test('toString is ISO-8601 with a four-digit year', () => {
    expect(LocalDate.of(2021, 1, 1).toString()).toEqual('2021-01-01');
    expect(LocalDate.of(999, 12, 31).toString()).toEqual('0999-12-31');
    expect(LocalDate.of(2020, 2, 29).toString()).toEqual('2020-02-29');
  });

  test('equality is by value, not identity', () => {
    expect(LocalDate.of(2021, 1, 1).equals(LocalDate.of(2021, 1, 1))).toBe(true);
    expect(LocalDate.of(2021, 1, 1).equals(LocalDate.of(2021, 1, 2))).toBe(false);
    expect(LocalDate.of(2021, 1, 1).equals(null)).toBe(false);
  });

  test('a value that does not fit the pattern is rejected at the offending index', () => {
    expect(() => LocalDate.parse('2021-1-1', formatter)).toThrowError(
      new DateTimeParseException("Text '2021-1-1' could not be parsed at index 5"),
    );
  });

  test('an impossible date is rejected the way the JDK words it', () => {
    expect(() => LocalDate.of(2021, 2, 30)).toThrowError(
      new DateTimeException("Invalid date 'FEBRUARY 30'"),
    );
    expect(() => LocalDate.of(2021, 13, 1)).toThrowError(
      new DateTimeException('Invalid value for MonthOfYear (valid values 1 - 12): 13'),
    );
    expect(() => LocalDate.of(2021, 1, 32)).toThrowError(
      new DateTimeException('Invalid value for DayOfMonth (valid values 1 - 28/31): 32'),
    );
    expect(() => LocalDate.of(2021, 2, 29)).toThrowError(
      new DateTimeException("Invalid date 'February 29' as '2021' is not a leap year"),
    );
    expect(LocalDate.of(2000, 2, 29).toString()).toEqual('2000-02-29');
    expect(() => LocalDate.of(1900, 2, 29)).toThrow(DateTimeException);
  });
});
