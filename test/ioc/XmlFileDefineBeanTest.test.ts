/**
 * @author derekyi
 * @date 2020/11/26
 */
import { expect, test } from 'vitest';
import { DefaultListableBeanFactory, System, XmlBeanDefinitionReader } from '../../src/index.js';
import { Car } from '../bean/Car.js';
import { Person } from '../bean/Person.js';

test('testXmlFile', () => {
  const beanFactory = new DefaultListableBeanFactory();
  const beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);
  beanDefinitionReader.loadBeanDefinitions('classpath:spring.xml');

  const person = beanFactory.getBean('person') as Person;
  System.out.println(person);
  expect(person.getName()).toEqual('derek');
  expect(person.getCar()!.getBrand()).toEqual('porsche');

  const car = beanFactory.getBean('car') as Car;
  System.out.println(car);
  expect(car.getBrand()).toEqual('porsche');
});
