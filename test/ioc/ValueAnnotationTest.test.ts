/**
 * @author derekyi
 * @date 2020/12/27
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { Car } from '../bean/Car.js';

test('testValueAnnotation', () => {
  const applicationContext = new ClassPathXmlApplicationContext('classpath:value-annotation.xml');

  const car = applicationContext.getBean<Car>('car', Car);
  expect(car.getBrand()).toEqual('lamborghini');
});
