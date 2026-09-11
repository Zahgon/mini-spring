/**
 * @author derekyi
 * @date 2021/1/17
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext, LocalDate } from '../../src/index.js';
import { Car } from '../bean/Car.js';

test('testConversionService', () => {
  const applicationContext = new ClassPathXmlApplicationContext(
    'classpath:type-conversion-second-part.xml',
  );

  const car = applicationContext.getBean<Car>('car', Car);
  expect(car.getPrice()).toEqual(1000000);
  expect(car.getProduceDate()).toEqual(LocalDate.of(2021, 1, 1));
});
