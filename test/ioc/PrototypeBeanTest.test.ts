/**
 * @author derekyi
 * @date 2020/12/2
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { Car } from '../bean/Car.js';

test('testPrototype', () => {
  const applicationContext = new ClassPathXmlApplicationContext('classpath:prototype-bean.xml');

  const car1 = applicationContext.getBean<Car>('car', Car);
  const car2 = applicationContext.getBean<Car>('car', Car);
  expect(car1 !== car2).toBe(true);
});
