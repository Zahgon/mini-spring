/**
 * The runtime type information the container is built on.
 *
 * In the original this was `java.lang.Class` and `java.lang.reflect`, and the
 * JDK's own tests covered it. It is this repository's code now, so the
 * behaviour it has to provide — resolvable names, declared interfaces including
 * markers, retained generic arguments, declared field types, and the exact
 * `Class#toString()` rendering that ends up inside an error message — is tested
 * here. Every expected value was captured from OpenJDK 11.
 */

import { describe, expect, test } from 'vitest';
import {
  Advice,
  Aware,
  BeanFactoryAware,
  BeanPostProcessor,
  Boolean_,
  ClassNotFoundException,
  Component,
  DisposableBean,
  InitializingBean,
  Integer,
  Long,
  BeforeAdvice,
  MethodBeforeAdvice,
  MethodBeforeAdviceInterceptor,
  MethodInterceptor,
  NumberFormatException,
  Reflectable,
  Types,
  Value,
  classOf,
  declareInterface,
  findClass,
  forName,
  getClass,
  stringValueOf,
} from '../../src/index.js';
import { ABeforeAdvice } from '../common/ABeforeAdvice.js';
import { CustomerBeanPostProcessor } from '../common/CustomerBeanPostProcessor.js';
import { A } from '../bean/A.js';
import { Car } from '../bean/Car.js';
import { Person } from '../bean/Person.js';
import { WorldService } from '../service/WorldService.js';
import { WorldServiceImpl } from '../service/WorldServiceImpl.js';

describe('JavaLangTest', () => {
  describe('Class.forName', () => {
    test('resolves every name the XML fixtures use', () => {
      expect(forName('org.springframework.test.bean.Car')).toBe(classOf(Car));
      expect(forName('org.springframework.test.service.WorldServiceImpl')).toBe(
        classOf(WorldServiceImpl),
      );
      expect(forName('org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator').getName()).toEqual(
        'org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator',
      );
    });

    test('throws ClassNotFoundException for an unknown name', () => {
      expect(() => forName('org.springframework.test.bean.Nope')).toThrow(ClassNotFoundException);
      expect(findClass('org.springframework.test.bean.Nope')).toBeNull();
    });
  });

  describe('names', () => {
    test('getName and getSimpleName', () => {
      expect(classOf(Car).getName()).toEqual('org.springframework.test.bean.Car');
      expect(classOf(Car).getSimpleName()).toEqual('Car');
      expect(Types.int.getName()).toEqual('int');
    });

    test('toString, which is spliced into the getBean(Class) error message', () => {
      expect(classOf(Person).toString()).toEqual('class org.springframework.test.bean.Person');
      expect(Types.int.toString()).toEqual('int');
      expect(InitializingBean.toString()).toEqual(
        'interface org.springframework.beans.factory.InitializingBean',
      );
    });
  });

  describe('getInterfaces returns the directly declared interfaces only', () => {
    test('WorldServiceImpl declares WorldService, A declares none', () => {
      expect(classOf(WorldServiceImpl).getInterfaces().map((i) => i.getName())).toEqual([
        'org.springframework.test.service.WorldService',
      ]);
      expect(classOf(A).getInterfaces()).toEqual([]);
    });

    test('it stops at the declaration and does not walk the hierarchy', () => {
      // ABeforeAdvice implements MethodBeforeAdvice, which extends BeforeAdvice,
      // which extends Advice. getInterfaces() reports only the first.
      expect(classOf(ABeforeAdvice).getInterfaces()).toEqual([MethodBeforeAdvice]);
      expect(Advice.isAssignableFrom(classOf(ABeforeAdvice))).toBe(true);
      expect(classOf(ABeforeAdvice).getInterfaces()).not.toContain(Advice);

      // and the same for a class declaring two interfaces that each extend more
      expect(classOf(MethodBeforeAdviceInterceptor).getInterfaces()).toEqual([
        MethodInterceptor,
        BeforeAdvice,
      ]);
    });
  });

  describe('isAssignableFrom', () => {
    test('sees marker interfaces, which structural typing cannot', () => {
      // ABeforeAdvice implements MethodBeforeAdvice -> BeforeAdvice -> Advice,
      // and Advice has no members at all.
      expect(Advice.isAssignableFrom(classOf(ABeforeAdvice))).toBe(true);
      expect(MethodBeforeAdvice.isAssignableFrom(classOf(ABeforeAdvice))).toBe(true);
      expect(Advice.isAssignableFrom(classOf(Car))).toBe(false);
    });

    test('walks superclasses and superinterfaces', () => {
      expect(BeanPostProcessor.isAssignableFrom(classOf(CustomerBeanPostProcessor))).toBe(true);
      expect(InitializingBean.isAssignableFrom(classOf(Person))).toBe(true);
      expect(DisposableBean.isAssignableFrom(classOf(Person))).toBe(true);
      expect(Aware.isAssignableFrom(BeanFactoryAware)).toBe(true);
      expect(Types.Number.isAssignableFrom(Types.Integer)).toBe(true);
      expect(Types.Integer.isAssignableFrom(Types.Number)).toBe(false);
      expect(Types.Object.isAssignableFrom(classOf(Car))).toBe(true);
    });

    test('a primitive is assignable only from itself', () => {
      expect(Types.int.isAssignableFrom(Types.int)).toBe(true);
      expect(Types.int.isAssignableFrom(Types.Integer)).toBe(false);
      expect(Types.Object.isAssignableFrom(Types.int)).toBe(false);
    });
  });

  describe('declared fields', () => {
    test('carry the declared type TypeScript erases', () => {
      const car = classOf(Car);
      expect(car.getDeclaredField('price')!.getType()).toBe(Types.int);
      expect(car.getDeclaredField('date')!.getType()).toBe(Types.long);
      expect(car.getDeclaredField('brand')!.getType()).toBe(Types.String);
      expect(car.getDeclaredField('produceDate')!.getType().getName()).toEqual('java.time.LocalDate');
      expect(classOf(Person).getDeclaredField('car')!.getType()).toBe(classOf(Car));
      expect(car.getDeclaredField('nope')).toBeNull();
    });

    test('carry their annotations', () => {
      expect(classOf(Car).getDeclaredField('brand')!.getAnnotation(Value.annotationType)).toEqual({
        value: '${brand}',
      });
      expect(classOf(Car).getDeclaredField('price')!.getAnnotation(Value.annotationType)).toBeNull();
    });
  });

  test('class annotations', () => {
    expect(classOf(Car).getAnnotation(Component.annotationType)).toEqual({ value: '' });
    expect(classOf(A).getAnnotation(Component.annotationType)).toBeNull();
  });

  test('getGenericInterfaces keeps the actual type arguments', () => {
    const listener = forName('org.springframework.test.common.event.CustomEventListener');
    const generic = listener.getGenericInterfaces()[0]!;
    expect(generic.getTypeName()).toEqual(
      'org.springframework.context.ApplicationListener<org.springframework.test.common.event.CustomEvent>',
    );
    expect(listener.getInterfaces()[0]!.getName()).toEqual(
      'org.springframework.context.ApplicationListener',
    );
  });

  test('getClass of a value', () => {
    expect(getClass('x')).toBe(Types.String);
    expect(getClass(new Car())).toBe(classOf(Car));
  });

  test('getMethod finds inherited methods, getDeclaredMethod does not', () => {
    const car = classOf(Car);
    expect(car.getMethod('init')!.getName()).toEqual('init');
    expect(car.getMethod('nope')).toBeNull();
    expect(() => car.getDeclaredMethod('nope')).toThrow(ClassNotFoundException);
  });

  describe('boxed types', () => {
    test('Integer.valueOf', () => {
      expect(Integer.valueOf('8888')).toEqual(8888);
      expect(Integer.valueOf('-1')).toEqual(-1);
      expect(Integer.valueOf('+7')).toEqual(7);
      expect(() => Integer.valueOf('abc')).toThrowError(
        new NumberFormatException('For input string: "abc"'),
      );
      expect(() => Integer.valueOf('2147483648')).toThrowError(
        new NumberFormatException('For input string: "2147483648"'),
      );
      expect(() => Integer.valueOf('')).toThrow(NumberFormatException);
      expect(() => Integer.valueOf('1.5')).toThrow(NumberFormatException);
    });

    test('Long.valueOf is 64-bit', () => {
      expect(Long.valueOf('8888')).toEqual(8888n);
      expect(Long.valueOf('9223372036854775807')).toEqual(9223372036854775807n);
      expect(() => Long.valueOf('9223372036854775808')).toThrow(NumberFormatException);
    });

    test('Boolean.parseBoolean is case-insensitive "true" and nothing else', () => {
      expect(Boolean_.parseBoolean('true')).toBe(true);
      expect(Boolean_.parseBoolean('TRUE')).toBe(true);
      expect(Boolean_.parseBoolean('false')).toBe(false);
      expect(Boolean_.parseBoolean('yes')).toBe(false);
      expect(Boolean_.parseBoolean(null)).toBe(false);
      expect(Boolean_.parseBoolean('')).toBe(false);
    });

    test('String.valueOf renders null as "null"', () => {
      expect(stringValueOf(null)).toEqual('null');
      expect(stringValueOf(undefined)).toEqual('null');
      expect(stringValueOf(['a', 'b'])).toEqual('[a, b]');
      expect(stringValueOf([])).toEqual('[]');
    });
  });
});

describe('JavaLangTest — invoking a method declared on an interface', () => {
  test('an interface method resolves to the implementation at call time', () => {
    const explode = WorldService.getDeclaredMethod('explode');
    expect(explode.getDeclaringClass()).toBe(WorldService);
    const target = new WorldServiceImpl();
    target.setName('earth');
    const lines: string[] = [];
    const original = console.log;
    console.log = (message: unknown): void => {
      lines.push(String(message));
    };
    try {
      explode.invoke(target);
    } finally {
      console.log = original;
    }
    expect(lines).toEqual(['The earth is going to explode']);
    expect(WorldService.getDeclaredMethod('getName').invoke(target)).toEqual('earth');
  });
});

describe('JavaLangTest — a declared interface method with parameters', () => {
  test('its parameter types are retained and it dispatches to the implementation', () => {
    interface Sink {
      accept(value: string, times: number): string;
    }
    const Sink = declareInterface('org.springframework.test.deps.Sink', {
      methods: { accept: [Types.String, Types.int] },
    });

    @Reflectable('org.springframework.test.deps.RepeatingSink', { implements: [Sink] })
    class RepeatingSink implements Sink {
      accept(value: string, times: number): string {
        return value.repeat(times);
      }
    }

    const accept = Sink.getDeclaredMethod('accept');
    expect(accept.getParameterTypes()).toEqual([Types.String, Types.int]);
    expect(accept.getParameterCount()).toEqual(2);
    expect(accept.invoke(new RepeatingSink(), ['ab', 3])).toEqual('ababab');
    expect(Sink.isAssignableFrom(classOf(RepeatingSink))).toBe(true);
  });
});
