/**
 * @author derekyi
 * @date 2020/12/13
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { Car } from '../bean/Car.js';

test('test', () => {
  const applicationContext = new ClassPathXmlApplicationContext(
    'classpath:property-placeholder-configurer.xml',
  );

  const car = applicationContext.getBean<Car>('car', Car);
  expect(car.getBrand()).toEqual('lamborghini');
});
