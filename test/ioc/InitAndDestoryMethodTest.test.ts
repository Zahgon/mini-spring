/**
 * @author derekyi
 * @date 2020/11/29
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { recordOutput } from '../support/output.js';

test('testInitAndDestroyMethod', () => {
  let applicationContext!: ClassPathXmlApplicationContext;
  // InitializingBean#afterPropertiesSet runs first, then the named init-method
  expect(
    recordOutput(() => {
      applicationContext = new ClassPathXmlApplicationContext(
        'classpath:init-and-destroy-method.xml',
      );
    }),
  ).toEqual([
    'I was born in the method named afterPropertiesSet',
    'I was born in the method named customInitMethod',
  ]);
  applicationContext.registerShutdownHook(); // or close it by hand: applicationContext.close();
});
