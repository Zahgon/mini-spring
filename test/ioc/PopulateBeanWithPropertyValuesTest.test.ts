/**
 * @author derekyi
 * @date 2020/11/24
 */
import { expect, test } from 'vitest';
import {
  BeanDefinition,
  BeanReference,
  DefaultListableBeanFactory,
  PropertyValue,
  PropertyValues,
  System,
  classOf,
} from '../../src/index.js';
import { Car } from '../bean/Car.js';
import { Person } from '../bean/Person.js';

test('testPopulateBeanWithPropertyValues', () => {
  const beanFactory = new DefaultListableBeanFactory();
  const propertyValues = new PropertyValues();
  propertyValues.addPropertyValue(new PropertyValue('name', 'derek'));
  propertyValues.addPropertyValue(new PropertyValue('age', 18));
  const beanDefinition = new BeanDefinition(classOf(Person), propertyValues);
  beanFactory.registerBeanDefinition('person', beanDefinition);

  const person = beanFactory.getBean('person') as Person;
  System.out.println(person);
  expect(person.getName()).toEqual('derek');
  expect(person.getAge()).toEqual(18);
});

/**
 * Injects a bean into a bean.
 */
test('testPopulateBeanWithBean', () => {
  const beanFactory = new DefaultListableBeanFactory();

  // register the Car instance
  const propertyValuesForCar = new PropertyValues();
  propertyValuesForCar.addPropertyValue(new PropertyValue('brand', 'porsche'));
  const carBeanDefinition = new BeanDefinition(classOf(Car), propertyValuesForCar);
  beanFactory.registerBeanDefinition('car', carBeanDefinition);

  // register the Person instance
  const propertyValuesForPerson = new PropertyValues();
  propertyValuesForPerson.addPropertyValue(new PropertyValue('name', 'derek'));
  propertyValuesForPerson.addPropertyValue(new PropertyValue('age', 18));
  // the Person instance depends on the Car instance
  propertyValuesForPerson.addPropertyValue(new PropertyValue('car', new BeanReference('car')));
  const beanDefinition = new BeanDefinition(classOf(Person), propertyValuesForPerson);
  beanFactory.registerBeanDefinition('person', beanDefinition);

  const person = beanFactory.getBean('person') as Person;
  System.out.println(person);
  expect(person.getName()).toEqual('derek');
  expect(person.getAge()).toEqual(18);
  const car = person.getCar();
  expect(car).not.toBeNull();
  expect(car!.getBrand()).toEqual('porsche');
});
