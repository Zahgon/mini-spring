/**
 * @author derekyi
 * @date 2020/12/1
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { HelloService } from '../service/HelloService.js';

test('test', () => {
  const applicationContext = new ClassPathXmlApplicationContext('classpath:spring.xml');
  const helloService = applicationContext.getBean<HelloService>('helloService', HelloService);
  expect(helloService.getApplicationContext()).not.toBeNull();
  expect(helloService.getBeanFactory()).not.toBeNull();
});
