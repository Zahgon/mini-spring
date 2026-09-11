/**
 * @author derekyi
 * @date 2020/12/2
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { Car } from '../bean/Car.js';

test('testFactoryBean', () => {
  const applicationContext = new ClassPathXmlApplicationContext('classpath:factory-bean.xml');

  const car = applicationContext.getBean<Car>('car', Car);
  expect(car.getBrand()).toEqual('porsche');
});
