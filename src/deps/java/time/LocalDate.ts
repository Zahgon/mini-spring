/**
 * `java.time.LocalDate` and the `DateTimeFormatter.ofPattern` subset the
 * repository uses (`"yyyy-MM-dd"`).
 *
 * `Intl` cannot stand in for this: `LocalDate` has no time zone at all, its
 * `equals` is value equality on the three fields, and `toString()` is ISO-8601.
 */

import { IllegalArgumentException, RuntimeException } from '../lang/Exceptions.js';
import { classOf, Reflectable, type Ctor, type JavaClass } from '../lang/Class.js';

/** `java.time.DateTimeException` */
export class DateTimeException extends RuntimeException {}

export class DateTimeParseException extends DateTimeException {}

const SUPPORTED_LETTERS: Record<string, 'year' | 'month' | 'day'> = {
  y: 'year',
  M: 'month',
  d: 'day',
};

interface PatternField {
  readonly field: 'year' | 'month' | 'day';
  readonly width: number;
}

type PatternPart = PatternField | { readonly literal: string };

export class DateTimeFormatter {
  private constructor(
    private readonly pattern: string,
    private readonly parts: readonly PatternPart[],
  ) {}

  static ofPattern(pattern: string): DateTimeFormatter {
    const parts: PatternPart[] = [];
    for (let index = 0; index < pattern.length; ) {
      const character = pattern[index]!;
      const field = SUPPORTED_LETTERS[character];
      if (field === undefined) {
        if (/[A-Za-z]/.test(character)) {
          throw new IllegalArgumentException(`Unsupported pattern letter: ${character}`);
        }
        parts.push({ literal: character });
        index++;
        continue;
      }
      let width = 0;
      while (pattern[index] === character) {
        width++;
        index++;
      }
      parts.push({ field, width });
    }
    return new DateTimeFormatter(pattern, parts);
  }

  parse(text: string): { year: number; month: number; day: number } {
    const values = { year: 0, month: 0, day: 0 };
    let position = 0;
    for (const part of this.parts) {
      if ('literal' in part) {
        if (text[position] !== part.literal) {
          throw new DateTimeParseException(
            `Text '${text}' could not be parsed at index ${String(position)}`,
          );
        }
        position++;
        continue;
      }
      const digits = text.slice(position, position + part.width);
      if (digits.length !== part.width || !/^[0-9]+$/.test(digits)) {
        throw new DateTimeParseException(
          `Text '${text}' could not be parsed at index ${String(position)}`,
        );
      }
      values[part.field] = Number.parseInt(digits, 10);
      position += part.width;
    }
    if (position !== text.length) {
      throw new DateTimeParseException(
        `Text '${text}' could not be parsed, unparsed text found at index ${String(position)}`,
      );
    }
    return values;
  }

  format(date: LocalDate): string {
    let result = '';
    for (const part of this.parts) {
      if ('literal' in part) {
        result += part.literal;
        continue;
      }
      const value =
        part.field === 'year'
          ? date.getYear()
          : part.field === 'month'
            ? date.getMonthValue()
            : date.getDayOfMonth();
      result += String(value).padStart(part.width, '0');
    }
    return result;
  }

  toString(): string {
    return this.pattern;
  }
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export class LocalDate {
  private constructor(
    private readonly year: number,
    private readonly month: number,
    private readonly day: number,
  ) {}

  static of(year: number, month: number, dayOfMonth: number): LocalDate {
    if (month < 1 || month > 12) {
      throw new DateTimeException(
        `Invalid value for MonthOfYear (valid values 1 - 12): ${String(month)}`,
      );
    }
    if (dayOfMonth < 1 || dayOfMonth > 31) {
      throw new DateTimeException(
        `Invalid value for DayOfMonth (valid values 1 - 28/31): ${String(dayOfMonth)}`,
      );
    }
    if (dayOfMonth > DAYS_IN_MONTH[month - 1]!) {
      if (month === 2 && dayOfMonth === 29 && !isLeapYear(year)) {
        throw new DateTimeException(
          `Invalid date 'February 29' as '${String(year)}' is not a leap year`,
        );
      }
      if (!(month === 2 && dayOfMonth === 29)) {
        throw new DateTimeException(
          `Invalid date '${MONTH_NAMES[month - 1]!} ${String(dayOfMonth)}'`,
        );
      }
    }
    return new LocalDate(year, month, dayOfMonth);
  }

  static parse(text: string, formatter: DateTimeFormatter): LocalDate {
    const { year, month, day } = formatter.parse(text);
    return LocalDate.of(year, month, day);
  }

  getYear(): number {
    return this.year;
  }

  getMonthValue(): number {
    return this.month;
  }

  getDayOfMonth(): number {
    return this.day;
  }

  equals(other: unknown): boolean {
    return (
      other instanceof LocalDate &&
      other.year === this.year &&
      other.month === this.month &&
      other.day === this.day
    );
  }

  hashCode(): number {
    return (this.year & 0xfffff800) ^ ((this.year << 11) + (this.month << 6) + this.day);
  }

  /** ISO-8601, as `LocalDate.toString()` produces. */
  toString(): string {
    const year = this.year < 0 ? `-${String(-this.year).padStart(4, '0')}` : String(this.year).padStart(4, '0');
    return `${year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`;
  }
}

// LocalDate's constructor is private — as it is in the JDK — so it cannot be
// used where a public constructor type is expected. It is registered by hand,
// and `LocalDateClass` is the `LocalDate.class` literal for the field and
// converter declarations that need it.
Reflectable('java.time.LocalDate')(LocalDate as unknown as Ctor);

/** `java.time.LocalDate.class` */
export const LocalDateClass: JavaClass = classOf(LocalDate as unknown as Ctor);
