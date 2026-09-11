/**
 * Test 1: an ordinary object with no circular reference (the helloService
 * object of spring.xml).
 *
 * The BeanPostProcessor returns the original bean; at the end the
 * second-level cache is empty, which means there is no circular reference,
 * so the initialised bean goes into the first-level cache.
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext, type ApplicationContext } from '../../src/index.js';
import { A } from '../bean/A.js';
import { B } from '../bean/B.js';
import { C } from '../bean/C.js';
import { HelloService } from '../service/HelloService.js';

test('test1', () => {
  const context: ApplicationContext = new ClassPathXmlApplicationContext('classpath:spring.xml');
  const helloService = context.getBean<HelloService>('helloService', HelloService);
  helloService.sayHello();
});

/**
 * Test 2: a proxied object with no circular reference (the c object of
 * circular-reference-with-proxy-bean-2.xml).
 *
 * The BeanPostProcessor returns a proxy bean; at the end the second-level
 * cache is empty, which means there is no circular reference, so the proxy
 * bean goes into the first-level cache.
 */
test('test2', () => {
  const context: ApplicationContext = new ClassPathXmlApplicationContext(
    'classpath:circular-reference-with-proxy-bean-2.xml',
  );
  const c = context.getBean('c') as C;
  c.sayHello();
});

/**
 * Test 3: ordinary objects with a circular reference (the a and b objects of
 * circular-reference-without-proxy-bean.xml).
 *
 * The BeanPostProcessor returns ordinary beans; at the end the second-level
 * cache holds a value, which means there is a circular reference, so — to
 * keep a.getB() == b — the bean from the second-level cache goes into the
 * first-level cache.
 */
test('test3', () => {
  const context: ApplicationContext = new ClassPathXmlApplicationContext(
    'classpath:circular-reference-without-proxy-bean.xml',
  );
  // A is an ordinary object
  const a = context.getBean('a') as A;
  // B is an ordinary object
  const b = context.getBean('b') as B;

  expect(a.getB() === b).toBe(true);
  expect(b.getA() === a).toBe(true);
});

/**
 * Test 4: a proxied object with a circular reference (the a object of
 * circular-reference-with-proxy-bean.xml).
 *
 * The BeanPostProcessor is skipped; at the end the second-level cache holds
 * the proxy object, which goes into the first-level cache.
 */
test('test4', () => {
  const context: ApplicationContext = new ClassPathXmlApplicationContext(
    'classpath:circular-reference-with-proxy-bean.xml',
  );
  // A is a proxy object
  const a = context.getBean('a') as A;
  // B is an ordinary object
  const b = context.getBean('b') as B;

  a.func();

  // the second- and first-level caches hold the same object for a, so
  // b.getA() == a is true
  expect(b.getA() === a).toBe(true);
});
