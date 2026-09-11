import {
  Converter as ConverterType,
  DateTimeFormatter,
  LocalDate,
  LocalDateClass,
  Reflectable,
  Types,
  type Converter,
} from '../../src/index.js';

/**
 * @author derekyi
 * @date 2021/1/17
 */
@Reflectable('org.springframework.test.common.StringToLocalDateConverter', {
  implements: [ConverterType.of(Types.String, LocalDateClass)],
})
export class StringToLocalDateConverter implements Converter<string, LocalDate> {
  private readonly DATE_TIME_FORMATTER: DateTimeFormatter;

  constructor(pattern: string) {
    this.DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern(pattern);
  }

  convert(source: string): LocalDate {
    return LocalDate.parse(source, this.DATE_TIME_FORMATTER);
  }
}
