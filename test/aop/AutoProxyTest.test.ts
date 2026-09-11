/**
 * @author derekyi
 * @date 2020/12/6
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { WorldService } from '../service/WorldService.js';

test('testAutoProxy', () => {
  const applicationContext = new ClassPathXmlApplicationContext('classpath:auto-proxy.xml');

  // fetch the proxy object
  const worldService = applicationContext.getBean<WorldService>('worldService', WorldService);
  worldService.explode();
});

test('testPopulateProxyBeanWithPropertyValues', () => {
  const applicationContext = new ClassPathXmlApplicationContext(
    'classpath:populate-proxy-bean-with-property-values.xml',
  );

  // fetch the proxy object
  const worldService = applicationContext.getBean<WorldService>('worldService', WorldService);
  worldService.explode();
  expect(worldService.getName()).toEqual('earth');
});
