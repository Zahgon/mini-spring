/**
 * @author derekyi
 * @date 2021/1/25
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { A } from '../bean/A.js';
import { B } from '../bean/B.js';

test('testCircularReference', () => {
  const applicationContext = new ClassPathXmlApplicationContext(
    'classpath:circular-reference-without-proxy-bean.xml',
  );
  const a = applicationContext.getBean<A>('a', A);
  const b = applicationContext.getBean<B>('b', B);
  expect(a.getB() === b).toBe(true);
});
