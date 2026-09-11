/**
 * The container's error surface and the collection orders it exposes.
 *
 * None of the ported tests exercises a failure path, yet every message here is
 * user-visible and several of them are assembled by string concatenation whose
 * exact shape — including the missing space in "…Personexpected single bean…" —
 * is easy to lose in a port. Each expected value was captured by running the
 * same code against the Java original.
 */

import { describe, expect, test } from 'vitest';
import {
  BeanDefinition,
  BeanReference,
  BeansException,
  ClassPathXmlApplicationContext,
  DefaultConversionService,
  DefaultListableBeanFactory,
  GenericConversionService,
  IllegalArgumentException,
  LocalDateClass,
  NumberFormatException,
  PropertyValue,
  PropertyValues,
  StringToNumberConverterFactory,
  Types,
  XmlBeanDefinitionReader,
  classOf,
} from '../../src/index.js';
import { AspectJExpressionPointcutAdvisor } from '../../src/index.js';
import { Car } from '../bean/Car.js';
import { Person } from '../bean/Person.js';

describe('ContainerContractTest', () => {
  describe('BeanFactory lookup failures', () => {
    test('an unknown bean name', () => {
      const beanFactory = new DefaultListableBeanFactory();
      expect(() => beanFactory.getBean('nope')).toThrowError(
        new BeansException("No bean named 'nope' is defined"),
      );
    });

    test('a by-type lookup that matches nothing', () => {
      const beanFactory = new DefaultListableBeanFactory();
      expect(() => beanFactory.getBean(Person)).toThrowError(
        new BeansException(
          'class org.springframework.test.bean.Personexpected single bean but found 0: []',
        ),
      );
    });

    test('a by-type lookup that matches more than one bean', () => {
      const beanFactory = new DefaultListableBeanFactory();
      beanFactory.registerBeanDefinition('p1', new BeanDefinition(classOf(Person)));
      beanFactory.registerBeanDefinition('p2', new BeanDefinition(classOf(Person)));
      expect(() => beanFactory.getBean(Person)).toThrowError(
        new BeansException(
          'class org.springframework.test.bean.Personexpected single bean but found 2: [p1, p2]',
        ),
      );
    });
  });

  describe('bean creation failures', () => {
    test('an init method that does not exist is reported through three wrappings', () => {
      const beanFactory = new DefaultListableBeanFactory();
      const beanDefinition = new BeanDefinition(classOf(Car));
      beanDefinition.setInitMethodName('noSuchInit');
      beanFactory.registerBeanDefinition('car', beanDefinition);

      let thrown: unknown;
      try {
        beanFactory.getBean('car');
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(BeansException);
      expect((thrown as BeansException).message).toEqual('Instantiation of bean failed');
      const invocation = (thrown as BeansException).getCause() as BeansException;
      expect(invocation.message).toEqual('Invocation of init method of bean[car] failed');
      expect((invocation.getCause() as BeansException).message).toEqual(
        "Could not find an init method named 'noSuchInit' on bean with name 'car'",
      );
    });

    test('a duplicate bean name', () => {
      const beanFactory = new DefaultListableBeanFactory();
      const reader = new XmlBeanDefinitionReader(beanFactory);
      reader.loadBeanDefinitions('classpath:spring.xml');
      expect(() => reader.loadBeanDefinitions('classpath:spring.xml')).toThrowError(
        new BeansException('Duplicate beanName[person] is not allowed'),
      );
    });

    test('a class attribute that cannot be resolved', () => {
      const beanFactory = new DefaultListableBeanFactory();
      const reader = new XmlBeanDefinitionReader(beanFactory);
      expect(() => reader.loadBeanDefinitions('classpath:unresolvable-class.xml')).toThrowError(
        new BeansException('Cannot find class [org.springframework.test.bean.NoSuchBean]'),
      );
    });
  });

  describe('iteration order the container exposes', () => {
    test('getBeanDefinitionNames follows ConcurrentHashMap order, not insertion order', () => {
      const beanFactory = new DefaultListableBeanFactory();
      new XmlBeanDefinitionReader(beanFactory).loadBeanDefinitions('classpath:spring.xml');
      // spring.xml declares person, car, the two processors and helloService,
      // in that order; this is the order the container iterates them in.
      expect(beanFactory.getBeanDefinitionNames()).toEqual([
        'customBeanFactoryPostProcessor',
        'customerBeanPostProcessor',
        'person',
        'car',
        'helloService',
      ]);
    });

    test('getBeansOfType re-orders into HashMap order', () => {
      const context = new ClassPathXmlApplicationContext('classpath:auto-proxy.xml');
      expect(
        context
          .getBeansOfType<AspectJExpressionPointcutAdvisor>(AspectJExpressionPointcutAdvisor)
          .keys(),
      ).toEqual(['pointcutAdvisor', 'pointcutAdvisor2']);
    });
  });

  describe('BeanDefinition and PropertyValues', () => {
    test('the defaults', () => {
      const beanDefinition = new BeanDefinition(classOf(Car));
      expect(beanDefinition.isSingleton()).toBe(true);
      expect(beanDefinition.isPrototype()).toBe(false);
      expect(beanDefinition.isLazyInit()).toBe(false);
      expect(beanDefinition.getInitMethodName()).toBeNull();
      expect(beanDefinition.getDestroyMethodName()).toBeNull();
      expect(beanDefinition.getScope()).toEqual('singleton');
    });

    test('setScope flips both flags', () => {
      const beanDefinition = new BeanDefinition(classOf(Car));
      beanDefinition.setScope('prototype');
      expect(beanDefinition.isSingleton()).toBe(false);
      expect(beanDefinition.isPrototype()).toBe(true);
    });

    test('addPropertyValue overwrites in place, keeping the position', () => {
      const propertyValues = new PropertyValues();
      propertyValues.addPropertyValue(new PropertyValue('a', 1));
      propertyValues.addPropertyValue(new PropertyValue('b', 2));
      propertyValues.addPropertyValue(new PropertyValue('a', 3));
      expect(
        propertyValues.getPropertyValues().map((pv) => `${pv.getName()}=${String(pv.getValue())}`),
      ).toEqual(['a=3', 'b=2']);
      expect(propertyValues.getPropertyValue('a')!.getValue()).toEqual(3);
      expect(propertyValues.getPropertyValue('nope')).toBeNull();
    });

    test('a BeanReference carries only the name', () => {
      expect(new BeanReference('car').getBeanName()).toEqual('car');
    });
  });

  describe('the conversion service', () => {
    test('canConvert widens a primitive to its wrapper', () => {
      const conversionService = new GenericConversionService();
      conversionService.addConverterFactory(new StringToNumberConverterFactory());
      expect(conversionService.canConvert(Types.String, Types.int)).toBe(true);
      expect(conversionService.canConvert(Types.String, Types.long)).toBe(true);
      expect(conversionService.canConvert(Types.String, Types.String)).toBe(false);
      expect(conversionService.canConvert(Types.String, LocalDateClass)).toBe(false);
    });

    test('DefaultConversionService registers String -> Number and nothing else', () => {
      const conversionService = new DefaultConversionService();
      expect(conversionService.canConvert(Types.String, Types.Integer)).toBe(true);
      expect(conversionService.canConvert(Types.String, Types.Boolean)).toBe(false);
    });

    test('an unsupported number type', () => {
      expect(() =>
        new StringToNumberConverterFactory().getConverter(Types.Double).convert('1'),
      ).toThrowError(
        new IllegalArgumentException(
          'Cannot convert String [1] to target class [java.lang.Double]',
        ),
      );
    });

    test('an empty source string converts to null', () => {
      expect(new StringToNumberConverterFactory().getConverter(Types.Integer).convert('')).toBeNull();
    });

    test('a malformed number', () => {
      expect(() =>
        new StringToNumberConverterFactory().getConverter(Types.Integer).convert('abc'),
      ).toThrowError(new NumberFormatException('For input string: "abc"'));
      expect(() =>
        new StringToNumberConverterFactory().getConverter(Types.Integer).convert('2147483648'),
      ).toThrowError(new NumberFormatException('For input string: "2147483648"'));
    });
  });

  test('a prototype bean is never registered for destruction', () => {
    const beanFactory = new DefaultListableBeanFactory();
    const beanDefinition = new BeanDefinition(classOf(Person));
    beanDefinition.setScope('prototype');
    beanFactory.registerBeanDefinition('person', beanDefinition);
    beanFactory.getBean('person');
    // Person implements DisposableBean, but destroySingletons must not call it.
    const destroyed: string[] = [];
    const original = console.log;
    console.log = (message: unknown): void => {
      destroyed.push(String(message));
    };
    try {
      beanFactory.destroySingletons();
    } finally {
      console.log = original;
    }
    expect(destroyed).toEqual([]);
  });
});
