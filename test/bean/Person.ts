import {
  Autowired,
  Component,
  Reflectable,
  System,
  Types,
  stringValueOf,
  type DisposableBean,
  type InitializingBean,
} from '../../src/index.js';
import { DisposableBean as DisposableBeanType, InitializingBean as InitializingBeanType } from '../../src/index.js';
import { Car } from './Car.js';

/**
 * @author derekyi
 * @date 2020/11/24
 */
@Component()
@Reflectable('org.springframework.test.bean.Person', {
  implements: [InitializingBeanType, DisposableBeanType],
  fields: {
    name: Types.String,
    age: Types.int,
    car: Car,
  },
})
export class Person implements InitializingBean, DisposableBean {
  private name: string | null = null;

  private age = 0;

  @Autowired()
  private car: Car | null = null;

  customInitMethod(): void {
    System.out.println('I was born in the method named customInitMethod');
  }

  customDestroyMethod(): void {
    System.out.println('I died in the method named customDestroyMethod');
  }

  afterPropertiesSet(): void {
    System.out.println('I was born in the method named afterPropertiesSet');
  }

  destroy(): void {
    System.out.println('I died in the method named destroy');
  }

  getName(): string | null {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getAge(): number {
    return this.age;
  }

  setAge(age: number): void {
    this.age = age;
  }

  getCar(): Car | null {
    return this.car;
  }

  setCar(car: Car): void {
    this.car = car;
  }

  toString(): string {
    return (
      'Person{' +
      `name='${stringValueOf(this.name)}'` +
      `, age=${String(this.age)}` +
      `, car=${stringValueOf(this.car)}` +
      '}'
    );
  }
}
