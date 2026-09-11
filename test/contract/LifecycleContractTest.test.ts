/**
 * Lifecycle behaviour that the ported suite leaves untested: explicit
 * `close()`, the destruction rules of `DisposableBeanAdapter`, `@Scope` and
 * `@Qualifier` on scanned components, the CGLIB instantiation strategy, and
 * `ConversionServiceFactoryBean`'s converter classification.
 *
 * The Java suite never asserts any of it — the two tests that would have
 * registered a shutdown hook instead of closing the container, so their output
 * was lost at JVM exit. Every expected value here was captured by running the
 * equivalent code against the Java original.
 */

import { afterEach, describe, expect, test } from 'vitest';
import {
  AspectJExpressionPointcutAdvisor,
  BeanDefinition,
  BeansException,
  CglibSubclassingInstantiationStrategy,
  ClassPathXmlApplicationContext,
  ContextClosedEvent,
  ConversionServiceFactoryBean,
  ConvertiblePair,
  DefaultListableBeanFactory,
  DisposableBeanAdapter,
  IllegalArgumentException,
  MethodBeforeAdviceInterceptor,
  SimpleApplicationEventMulticaster,
  Types,
  XmlBeanDefinitionReader,
  classOf,
} from '../../src/index.js';
import { StringToNumberConverterFactory } from '../../src/index.js';
import { Car } from '../bean/Car.js';
import { Person } from '../bean/Person.js';
import { StringToBooleanConverter } from '../common/StringToBooleanConverter.js';
import { StringToIntegerConverter } from '../common/StringToIntegerConverter.js';
import { WorldServiceBeforeAdvice } from '../common/WorldServiceBeforeAdvice.js';
import { EngineA, Widget } from './beans.js';

let captured: string[] = [];
const original = console.log;

function capture(): void {
  captured = [];
  console.log = (message: unknown): void => {
    captured.push(String(message));
  };
}

afterEach(() => {
  console.log = original;
});

describe('LifecycleContractTest', () => {
  describe('close()', () => {
    test('runs both destruction methods, in DisposableBean-then-custom order', () => {
      const context = new ClassPathXmlApplicationContext(
        'classpath:init-and-destroy-method.xml',
      );
      capture();
      context.close();
      console.log = original;
      expect(captured).toEqual([
        'I died in the method named destroy',
        'I died in the method named customDestroyMethod',
      ]);
    });

    test('publishes ContextClosedEvent before destroying the singletons', () => {
      const context = new ClassPathXmlApplicationContext(
        'classpath:event-and-event-listener.xml',
      );
      capture();
      context.close();
      console.log = original;
      expect(captured).toEqual([
        'org.springframework.test.common.event.ContextClosedEventListener',
      ]);
    });

    test('a second close() destroys nothing more', () => {
      const context = new ClassPathXmlApplicationContext(
        'classpath:init-and-destroy-method.xml',
      );
      context.close();
      capture();
      context.close();
      console.log = original;
      expect(captured).toEqual([]);
    });
  });

  describe('DisposableBeanAdapter', () => {
    test('a destruction method that does not exist', () => {
      const beanDefinition = new BeanDefinition(classOf(Car));
      beanDefinition.setDestroyMethodName('noSuchDestroy');
      expect(() =>
        new DisposableBeanAdapter(new Car(), 'car', beanDefinition).destroy(),
      ).toThrowError(
        new BeansException(
          "Couldn't find a destroy method named 'noSuchDestroy' on bean with name 'car'",
        ),
      );
    });

    test('a custom method literally named "destroy" is not run twice', () => {
      const beanDefinition = new BeanDefinition(classOf(Person));
      beanDefinition.setDestroyMethodName('destroy');
      capture();
      new DisposableBeanAdapter(new Person(), 'person', beanDefinition).destroy();
      console.log = original;
      expect(captured).toEqual(['I died in the method named destroy']);
    });

    test('a differently named custom method runs after DisposableBean#destroy', () => {
      const beanDefinition = new BeanDefinition(classOf(Person));
      beanDefinition.setDestroyMethodName('customDestroyMethod');
      capture();
      new DisposableBeanAdapter(new Person(), 'person', beanDefinition).destroy();
      console.log = original;
      expect(captured).toEqual([
        'I died in the method named destroy',
        'I died in the method named customDestroyMethod',
      ]);
    });
  });

  describe('component scanning', () => {
    test('honours @Component(value), @Scope and @Qualifier', () => {
      const context = new ClassPathXmlApplicationContext('classpath:contract-scan.xml');
      expect(context.getBeanDefinitionNames()).toEqual([
        'engineB',
        'engineA',
        'org.springframework.context.annotation.internalAutowiredAnnotationProcessor',
        'widget',
      ]);
      expect(context.getBeanFactory().getBeanDefinition('widget').isPrototype()).toBe(true);

      const first = context.getBean('widget') as Widget;
      const second = context.getBean('widget') as Widget;
      expect(first !== second).toBe(true);
      // @Qualifier("engineB") picks the second implementation by name
      expect(first.getEngine()!.name()).toEqual('B');
    });
  });

  test('the CGLIB instantiation strategy produces a subclass instance', () => {
    const instance = new CglibSubclassingInstantiationStrategy().instantiate(
      new BeanDefinition(classOf(Car)),
    );
    expect(instance instanceof Car).toBe(true);
    expect(instance.constructor).not.toBe(Car);
    expect(classOf(Car).isInstance(instance)).toBe(true);
  });

  describe('ConversionServiceFactoryBean', () => {
    test('classifies GenericConverter, Converter and ConverterFactory', () => {
      const factoryBean = new ConversionServiceFactoryBean();
      factoryBean.setConverters(
        new Set<unknown>([
          new StringToIntegerConverter(),
          new StringToBooleanConverter(),
          new StringToNumberConverterFactory(),
        ]),
      );
      factoryBean.afterPropertiesSet();
      const conversionService = factoryBean.getObject();
      expect(conversionService.convert('5', Types.Integer)).toEqual(5);
      expect(conversionService.convert('true', Types.Boolean)).toBe(true);
      expect(conversionService.convert('6', Types.Long)).toEqual(6n);
      expect(factoryBean.isSingleton()).toBe(true);
    });

    test('rejects anything else', () => {
      const factoryBean = new ConversionServiceFactoryBean();
      factoryBean.setConverters(new Set<unknown>(['not a converter']));
      expect(() => factoryBean.afterPropertiesSet()).toThrowError(
        new IllegalArgumentException(
          'Each converter object must implement one of the ' +
            'Converter, ConverterFactory, or GenericConverter interfaces',
        ),
      );
    });

    test('no converters at all is accepted', () => {
      const factoryBean = new ConversionServiceFactoryBean();
      factoryBean.afterPropertiesSet();
      expect(factoryBean.getObject().canConvert(Types.String, Types.Integer)).toBe(true);
    });
  });

  test('ConvertiblePair is a value object, as the converter map needs', () => {
    const pair = new ConvertiblePair(Types.String, Types.Integer);
    const same = new ConvertiblePair(Types.String, Types.Integer);
    const other = new ConvertiblePair(Types.String, Types.Long);
    expect(pair.equals(same)).toBe(true);
    expect(pair.equals(other)).toBe(false);
    expect(pair.equals(null)).toBe(false);
    expect(pair.equals('x')).toBe(false);
    expect(pair.hashCode()).toEqual(same.hashCode());
    expect(pair.getSourceType().getName()).toEqual('java.lang.String');
    expect(pair.getTargetType().getName()).toEqual('java.lang.Integer');
  });

  test('BeanDefinition equality is by bean class', () => {
    const car = new BeanDefinition(classOf(Car));
    const sameCar = new BeanDefinition(classOf(Car));
    const person = new BeanDefinition(classOf(Person));
    expect(car.equals(sameCar)).toBe(true);
    expect(car.equals(person)).toBe(false);
    expect(car.equals(null)).toBe(false);
    expect(car.equals('x')).toBe(false);
    expect(car.hashCode()).toEqual(sameCar.hashCode());
    car.setBeanClass(classOf(Person));
    expect(car.getBeanClass()).toBe(classOf(Person));
  });

  test('an event carries the context that published it', () => {
    const context = new ClassPathXmlApplicationContext('classpath:spring.xml');
    expect(new ContextClosedEvent(context).getApplicationContext()).toBe(context);
    expect(new ContextClosedEvent(context).getSource()).toBe(context);
  });

  test('a listener can be removed again', () => {
    const beanFactory = new DefaultListableBeanFactory();
    const multicaster = new SimpleApplicationEventMulticaster(beanFactory);
    const listener = { onApplicationEvent: (): void => undefined };
    multicaster.addApplicationListener(listener);
    expect(multicaster.applicationListeners.size).toEqual(1);
    multicaster.removeApplicationListener(listener);
    expect(multicaster.applicationListeners.size).toEqual(0);
  });

  test('advice can be installed through the setter as well as the constructor', () => {
    const interceptor = new MethodBeforeAdviceInterceptor();
    interceptor.setAdvice(new WorldServiceBeforeAdvice());
    capture();
    const result = interceptor.invoke({
      proceed: () => 'done',
      getMethod: () => classOf(Car).getDeclaredMethod('init'),
      getArguments: () => [],
      getThis: () => null,
      getStaticPart: () => null,
    });
    console.log = original;
    expect(captured).toEqual(['BeforeAdvice: do something before the earth explodes']);
    expect(result).toEqual('done');
  });

  test('a bean definition reader can be pointed at a different resource loader', () => {
    const beanFactory = new DefaultListableBeanFactory();
    const reader = new XmlBeanDefinitionReader(beanFactory);
    const context = new ClassPathXmlApplicationContext('classpath:spring.xml');
    reader.setResourceLoader(context);
    expect(reader.getResourceLoader()).toBe(context);
    expect(reader.getRegistry()).toBe(beanFactory);
  });

  test('an advisor exposes the method matcher installed on the proxy factory', () => {
    const context = new ClassPathXmlApplicationContext('classpath:auto-proxy.xml');
    const advisor = context.getBean<AspectJExpressionPointcutAdvisor>(
      'pointcutAdvisor',
      AspectJExpressionPointcutAdvisor,
    );
    expect(advisor.getPointcut().getMethodMatcher()).toBe(advisor.getPointcut());
    expect(classOf(EngineA).getSimpleName()).toEqual('EngineA');
  });
});
