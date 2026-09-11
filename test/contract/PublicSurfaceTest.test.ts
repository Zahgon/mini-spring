/**
 * The accessors and secondary entry points of the ported public API.
 *
 * Every member here exists in the Java original, and none of them is reached by
 * any test in the original suite — the container populates fields reflectively
 * rather than through setters, so a whole layer of the published API was never
 * executed. It is executed here, so that a port that silently dropped one of
 * these, or wired it to the wrong field, fails rather than passing unnoticed.
 */

import { describe, expect, test } from 'vitest';
import {
  AdvisedSupport,
  AfterReturningAdviceInterceptor,
  AspectJExpressionPointcut,
  AspectJExpressionPointcutAdvisor,
  BeanDefinition,
  BeansException,
  ByteArrayInputStream,
  CglibSubclassingInstantiationStrategy,
  ClassPathResource,
  ClassPathXmlApplicationContext,
  ContextClosedEvent,
  DateTimeFormatter,
  DefaultListableBeanFactory,
  DefaultResourceLoader,
  DocumentException,
  FileSystemResource,
  JavaConcurrentHashMap,
  JavaHashMap,
  LocalDate,
  MethodBeforeAdvice,
  Properties,
  PropertyPlaceholderConfigurer,
  PropertyValue,
  PropertyValues,
  ProxyFactory,
  SAXReader,
  SimpleInstantiationStrategy,
  TargetSource,
  TimeUnit,
  Types,
  UrlResource,
  classOf,
  getClass,
  type MethodInvocation,
} from '../../src/index.js';
import { ABeforeAdvice } from '../common/ABeforeAdvice.js';
import { Car } from '../bean/Car.js';
import { Person } from '../bean/Person.js';
import { WorldServiceAfterReturnAdvice } from '../common/WorldServiceAfterReturnAdvice.js';
import { WorldService } from '../service/WorldService.js';
import { WorldServiceImpl } from '../service/WorldServiceImpl.js';

describe('PublicSurfaceTest', () => {
  describe('AdvisedSupport / ProxyFactory', () => {
    test('the method matcher round-trips', () => {
      const advised = new AdvisedSupport();
      const pointcut = new AspectJExpressionPointcut(
        'execution(* org.springframework.test.service.WorldService.explode(..))',
      );
      advised.setMethodMatcher(pointcut);
      expect(advised.getMethodMatcher()).toBe(pointcut);
    });

    test('a MethodInvocation exposes its static part', () => {
      const worldService = new WorldServiceImpl();
      const factory = new ProxyFactory();
      factory.setTargetSource(new TargetSource(worldService));
      const advisor = new AspectJExpressionPointcutAdvisor();
      advisor.setExpression(
        'execution(* org.springframework.test.service.WorldService.explode(..))',
      );
      const seen: unknown[] = [];
      advisor.setAdvice({
        invoke(invocation: MethodInvocation): unknown {
          seen.push(invocation.getStaticPart());
          return invocation.proceed();
        },
      });
      factory.addAdvisor(advisor);
      (factory.getProxy() as WorldServiceImpl).explode();
      expect(seen).toEqual([classOf(WorldServiceImpl).getDeclaredMethod('explode')]);
    });

    test('after-returning advice can be installed through the setter', () => {
      const interceptor = new AfterReturningAdviceInterceptor();
      interceptor.setAdvice(new WorldServiceAfterReturnAdvice());
      const worldService = new WorldServiceImpl();
      const factory = new ProxyFactory();
      factory.setTargetSource(new TargetSource(worldService));
      const advisor = new AspectJExpressionPointcutAdvisor();
      advisor.setExpression(
        'execution(* org.springframework.test.service.WorldService.explode(..))',
      );
      advisor.setAdvice(interceptor);
      factory.addAdvisor(advisor);
      expect(() => (factory.getProxy() as WorldServiceImpl).explode()).not.toThrow();
    });
  });

  describe('BeanFactory configuration', () => {
    test('the instantiation strategy can be replaced', () => {
      const beanFactory = new DefaultListableBeanFactory();
      expect(beanFactory.getInstantiationStrategy()).toBeInstanceOf(SimpleInstantiationStrategy);
      const cglib = new CglibSubclassingInstantiationStrategy();
      beanFactory.setInstantiationStrategy(cglib);
      expect(beanFactory.getInstantiationStrategy()).toBe(cglib);

      beanFactory.registerBeanDefinition('car', new BeanDefinition(classOf(Car)));
      const car = beanFactory.getBean('car') as Car;
      expect(car instanceof Car).toBe(true);
      // instantiated through the subclassing strategy, so not Car itself
      expect(car.constructor).not.toBe(Car);
    });

    test('a BeanDefinition can have its property values replaced wholesale', () => {
      const beanDefinition = new BeanDefinition(classOf(Car));
      const propertyValues = new PropertyValues();
      propertyValues.addPropertyValue(new PropertyValue('brand', 'porsche'));
      beanDefinition.setPropertyValues(propertyValues);
      expect(beanDefinition.getPropertyValues()).toBe(propertyValues);

      const beanFactory = new DefaultListableBeanFactory();
      beanFactory.registerBeanDefinition('car', beanDefinition);
      expect((beanFactory.getBean('car') as Car).getBrand()).toEqual('porsche');
    });

    test('PropertyPlaceholderConfigurer takes its location from the setter', () => {
      const beanFactory = new DefaultListableBeanFactory();
      const beanDefinition = new BeanDefinition(classOf(Car));
      beanDefinition.getPropertyValues().addPropertyValue(new PropertyValue('brand', '${brand}'));
      beanFactory.registerBeanDefinition('car', beanDefinition);

      const configurer = new PropertyPlaceholderConfigurer();
      configurer.setLocation('classpath:car.properties');
      configurer.postProcessBeanFactory(beanFactory);

      expect((beanFactory.getBean('car') as Car).getBrand()).toEqual('lamborghini');
    });

    test('a location that cannot be read is reported', () => {
      const configurer = new PropertyPlaceholderConfigurer();
      configurer.setLocation('classpath:no-such.properties');
      expect(() =>
        configurer.postProcessBeanFactory(new DefaultListableBeanFactory()),
      ).toThrowError(new BeansException('Could not load properties'));
    });
  });

  describe('ApplicationContext', () => {
    test('containsBean answers from the bean definitions', () => {
      const context = new ClassPathXmlApplicationContext('classpath:spring.xml');
      expect(context.containsBean('car')).toBe(true);
      expect(context.containsBean('nope')).toBe(false);
    });

    test('the shutdown hook closes the context', () => {
      const context = new ClassPathXmlApplicationContext('classpath:init-and-destroy-method.xml');
      const before = process.listeners('exit').length;
      context.registerShutdownHook();
      const hooks = process.listeners('exit');
      expect(hooks.length).toEqual(before + 1);

      const hook = hooks[hooks.length - 1]!;
      const captured: string[] = [];
      const original = console.log;
      console.log = (message: unknown): void => {
        captured.push(String(message));
      };
      try {
        hook(0);
      } finally {
        console.log = original;
        process.removeListener('exit', hook);
      }
      expect(captured).toEqual([
        'I died in the method named destroy',
        'I died in the method named customDestroyMethod',
      ]);
    });

    test('an ApplicationEvent renders its source', () => {
      const context = new ClassPathXmlApplicationContext('classpath:spring.xml');
      expect(new ContextClosedEvent(context).toString()).toContain('ContextClosedEvent[source=');
    });
  });

  describe('Resource', () => {
    test('each kind describes itself', () => {
      const resourceLoader = new DefaultResourceLoader();
      expect(String(resourceLoader.getResource('classpath:hello.txt'))).toEqual(
        'class path resource [hello.txt]',
      );
      expect(String(resourceLoader.getResource('test/resources/hello.txt'))).toEqual(
        'file [test/resources/hello.txt]',
      );
      expect(String(resourceLoader.getResource('https://example.com/x'))).toEqual(
        'URL [https://example.com/x]',
      );
      expect(new ClassPathResource('a').getInputStream).toBeTypeOf('function');
      expect(new FileSystemResource('a')).toBeInstanceOf(FileSystemResource);
      expect(resourceLoader.getResource('https://example.com/x')).toBeInstanceOf(UrlResource);
    });
  });

  describe('the reproduced runtime', () => {
    test('a pointcut expression remembers its text and reports a non-match', () => {
      const expression = 'execution(* org.springframework.test.bean.A.func(..))';
      const pointcut = new AspectJExpressionPointcut(expression);
      const car = classOf(Car);
      expect(pointcut.matches(car.getDeclaredMethod('init'), car)).toBe(false);
    });

    test('a JavaMethod describes itself and reports its arity', () => {
      const method = classOf(WorldServiceImpl).getDeclaredMethod('setName');
      expect(method.getParameterCount()).toEqual(1);
      expect(method.toString()).toEqual(
        'org.springframework.test.service.WorldServiceImpl.setName()',
      );
      expect(classOf(WorldServiceImpl).getDeclaredMethod('explode').getParameterCount()).toEqual(0);
    });

    test('TargetSource reports the target\'s declared interfaces, and only those', () => {
      // this is what ProxyFactory branches on: an empty list forces CGLIB
      expect(new TargetSource(new WorldServiceImpl()).getTargetClass()).toEqual([WorldService]);
      expect(new TargetSource(new Car()).getTargetClass()).toEqual([]);
      // ABeforeAdvice implements MethodBeforeAdvice, which extends BeforeAdvice
      // and Advice; the target class list stops at the declaration
      expect(new TargetSource(new ABeforeAdvice()).getTargetClass()).toEqual([MethodBeforeAdvice]);
    });

    test('a proxy reports the class it stands for', () => {
      const worldService = new WorldServiceImpl();
      const factory = new ProxyFactory();
      factory.setTargetSource(new TargetSource(worldService));
      const proxy = factory.getProxy();
      expect(getClass(proxy)).toBe(classOf(WorldServiceImpl));
      expect(proxy).not.toBe(worldService);
    });

    test('a Throwable exposes its message and cause', () => {
      const cause = new BeansException('root');
      const wrapper = new BeansException('outer', cause);
      expect(wrapper.getMessage()).toEqual('outer');
      expect(wrapper.getCause()).toBe(cause);
      expect(new BeansException('').getMessage()).toBeNull();
    });

    test('LocalDate hashes by value and a formatter reports its pattern', () => {
      expect(LocalDate.of(2021, 1, 1).hashCode()).toEqual(LocalDate.of(2021, 1, 1).hashCode());
      expect(LocalDate.of(2021, 1, 1).hashCode()).not.toEqual(LocalDate.of(2021, 1, 2).hashCode());
      expect(DateTimeFormatter.ofPattern('yyyy-MM-dd').toString()).toEqual('yyyy-MM-dd');
    });

    test('Properties can be populated programmatically', () => {
      const properties = new Properties();
      properties.setProperty('brand', 'porsche');
      expect(properties.getProperty('brand')).toEqual('porsche');
    });

    test('TimeUnit converts as well as sleeps', () => {
      expect(TimeUnit.SECONDS.toMillis(2)).toEqual(2000);
      expect(TimeUnit.MILLISECONDS.toMillis(7)).toEqual(7);
      expect(TimeUnit.MINUTES.toMillis(1)).toEqual(60_000);
      const before = Date.now();
      TimeUnit.MILLISECONDS.sleep(0);
      expect(Date.now() - before).toBeLessThan(500);
    });

    test('the map API beyond what the container uses', () => {
      const hashMap = new JavaHashMap<string, number>();
      hashMap.put('a', 1);
      hashMap.put('b', 2);
      const seen: string[] = [];
      hashMap.forEach((value, key) => seen.push(`${key}=${String(value)}`));
      expect(seen).toEqual(['a=1', 'b=2']);
      expect(hashMap.values()).toEqual([1, 2]);

      const concurrent = new JavaConcurrentHashMap<string, number>();
      concurrent.put('a', 1);
      concurrent.put('b', 2);
      expect(concurrent.size).toEqual(2);
      expect(concurrent.values()).toEqual([1, 2]);
      expect(concurrent.remove('a')).toEqual(1);
      expect(concurrent.remove('a')).toBeUndefined();
      expect(concurrent.size).toEqual(1);
      expect(concurrent.get('nope')).toBeUndefined();
    });

    test('malformed XML is reported, not swallowed', () => {
      expect(() =>
        new SAXReader().read(new ByteArrayInputStream(Buffer.from('<a><b></a>', 'utf8'))),
      ).toThrow(DocumentException);
    });

    test('a class with no registered name still reports one', () => {
      class Unregistered {}
      expect(classOf(Unregistered).getName()).toEqual('Unregistered');
      expect(classOf(Unregistered).getSuperclass()).toBe(Types.Object);
    });

    test('an interface declared with a parameterised token erases to its raw form', () => {
      const person = classOf(Person);
      expect(person.getInterfaces().map((i) => i.getSimpleName()).sort()).toEqual([
        'DisposableBean',
        'InitializingBean',
      ]);
    });
  });
});
