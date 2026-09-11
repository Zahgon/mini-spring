import { FactoryBean as FactoryBeanType, Reflectable, type FactoryBean } from '../../src/index.js';
import { Car } from '../bean/Car.js';

/**
 * @author derekyi
 * @date 2020/12/2
 */
@Reflectable('org.springframework.test.common.CarFactoryBean', {
  implements: [FactoryBeanType.of(Car)],
})
export class CarFactoryBean implements FactoryBean<Car> {
  private brand!: string;

  getObject(): Car {
    const car = new Car();
    car.setBrand(this.brand);
    return car;
  }

  isSingleton(): boolean {
    return true;
  }

  setBrand(brand: string): void {
    this.brand = brand;
  }
}
