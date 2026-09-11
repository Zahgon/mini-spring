/**
 * @author derekyi
 * @date 2020/11/28
 */
import { expect, test } from 'vitest';
import { DefaultListableBeanFactory, System, XmlBeanDefinitionReader } from '../../src/index.js';
import { Car } from '../bean/Car.js';
import { Person } from '../bean/Person.js';
import { CustomBeanFactoryPostProcessor } from '../common/CustomBeanFactoryPostProcessor.js';
import { CustomerBeanPostProcessor } from '../common/CustomerBeanPostProcessor.js';

test('testBeanFactoryPostProcessor', () => {
  const beanFactory = new DefaultListableBeanFactory();
  const beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);
  beanDefinitionReader.loadBeanDefinitions('classpath:spring.xml');

  // once every BeanDefinition has been loaded, but before any bean has been
  // instantiated, modify the property values of a BeanDefinition
  const beanFactoryPostProcessor = new CustomBeanFactoryPostProcessor();
  beanFactoryPostProcessor.postProcessBeanFactory(beanFactory);

  const person = beanFactory.getBean('person') as Person;
  System.out.println(person);
  // the name property was changed to ivy by CustomBeanFactoryPostProcessor
  expect(person.getName()).toEqual('ivy');
});

test('testBeanPostProcessor', () => {
  const beanFactory = new DefaultListableBeanFactory();
  const beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);
  beanDefinitionReader.loadBeanDefinitions('classpath:spring.xml');

  // register the processor that runs after a bean is instantiated
  const customerBeanPostProcessor = new CustomerBeanPostProcessor();
  beanFactory.addBeanPostProcessor(customerBeanPostProcessor);

  const car = beanFactory.getBean('car') as Car;
  System.out.println(car);
  // the brand property was changed to lamborghini by CustomerBeanPostProcessor
  expect(car.getBrand()).toEqual('lamborghini');
});
