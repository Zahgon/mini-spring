import {
  Component,
  LocalDate,
  LocalDateClass,
  Reflectable,
  System,
  Types,
  Value,
  stringValueOf,
} from '../../src/index.js';

/**
 * @author derekyi
 * @date 2020/11/24
 */
@Component()
@Reflectable('org.springframework.test.bean.Car', {
  fields: {
    price: Types.int,
    produceDate: LocalDateClass,
    date: Types.long,
    brand: Types.String,
  },
})
export class Car {
  private price = 0;

  private produceDate: LocalDate | null = null;

  private date = 0;

  @Value('${brand}')
  private brand: string | null = null;

  getBrand(): string | null {
    return this.brand;
  }

  setBrand(brand: string): void {
    this.brand = brand;
  }

  getPrice(): number {
    return this.price;
  }

  setPrice(price: number): void {
    this.price = price;
  }

  getProduceDate(): LocalDate | null {
    return this.produceDate;
  }

  setProduceDate(produceDate: LocalDate): void {
    this.produceDate = produceDate;
  }

  init(): void {
    this.date = System.currentTimeMillis();
  }

  showTime(): void {
    System.out.println(`${String(this.date)}:bean create`);
  }

  toString(): string {
    return (
      'Car{' +
      `price=${String(this.price)}` +
      `, produceDate=${stringValueOf(this.produceDate)}` +
      `, brand='${stringValueOf(this.brand)}'` +
      '}'
    );
  }
}
