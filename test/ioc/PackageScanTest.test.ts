/**
 * @author derekyi
 * @date 2020/12/26
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { Car } from '../bean/Car.js';

test('testScanPackage', () => {
  const applicationContext = new ClassPathXmlApplicationContext('classpath:package-scan.xml');

  const car = applicationContext.getBean<Car>('car', Car);
  expect(car).not.toBeNull();
});
