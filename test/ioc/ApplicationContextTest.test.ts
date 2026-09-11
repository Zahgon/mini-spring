/**
 * @author derekyi
 * @date 2020/11/28
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext, System } from '../../src/index.js';
import { Car } from '../bean/Car.js';
import { Person } from '../bean/Person.js';

test('testApplicationContext', () => {
  const applicationContext = new ClassPathXmlApplicationContext('classpath:spring.xml');

  const person = applicationContext.getBean<Person>('person', Person);
  System.out.println(person);
  // the name property was changed to ivy by CustomBeanFactoryPostProcessor
  expect(person.getName()).toEqual('ivy');

  const car = applicationContext.getBean<Car>('car', Car);
  System.out.println(car);
  // the brand property was changed to lamborghini by CustomerBeanPostProcessor
  expect(car.getBrand()).toEqual('lamborghini');
});
