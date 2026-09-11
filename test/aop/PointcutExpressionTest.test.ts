/**
 * @author derekyi
 * @date 2020/12/5
 */
import { expect, test } from 'vitest';
import { AspectJExpressionPointcut, classOf } from '../../src/index.js';
import { HelloService } from '../service/HelloService.js';

test('testPointcutExpression', () => {
  const pointcut = new AspectJExpressionPointcut(
    'execution(* org.springframework.test.service.HelloService.*(..))',
  );
  const clazz = classOf(HelloService);
  const method = clazz.getDeclaredMethod('sayHello');

  expect(pointcut.matches(clazz)).toBe(true);
  expect(pointcut.matches(method, clazz)).toBe(true);
});
