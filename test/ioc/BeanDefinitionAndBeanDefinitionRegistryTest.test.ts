/**
 * @author derekyi
 * @date 2020/11/24
 */
import { expect, test } from 'vitest';
import { BeanDefinition, DefaultListableBeanFactory, classOf } from '../../src/index.js';
import { recordOutput } from '../support/output.js';
import { HelloService } from '../service/HelloService.js';

test('testBeanFactory', () => {
  const beanFactory = new DefaultListableBeanFactory();
  const beanDefinition = new BeanDefinition(classOf(HelloService));
  beanFactory.registerBeanDefinition('helloService', beanDefinition);

  const helloService = beanFactory.getBean('helloService') as HelloService;
  expect(recordOutput(() => expect(helloService.sayHello()).toEqual('hello'))).toEqual(['hello']);
});
