import { expect, test } from 'vitest';
import {
  AfterReturningAdviceInterceptor,
  AspectJExpressionPointcutAdvisor,
  MethodBeforeAdviceInterceptor,
  ProxyFactory,
  TargetSource,
} from '../../src/index.js';
import { recordOutput } from '../support/output.js';
import { WorldServiceAfterReturnAdvice } from '../common/WorldServiceAfterReturnAdvice.js';
import { WorldServiceBeforeAdvice } from '../common/WorldServiceBeforeAdvice.js';
import type { WorldService } from '../service/WorldService.js';
import { WorldServiceImpl } from '../service/WorldServiceImpl.js';

test('testAdvisor', () => {
  const worldService: WorldService = new WorldServiceImpl();

  // an Advisor is a Pointcut and an Advice together
  const expression = 'execution(* org.springframework.test.service.WorldService.explode(..))';
  // the first aspect
  const advisor = new AspectJExpressionPointcutAdvisor();
  advisor.setExpression(expression);
  const methodInterceptor = new MethodBeforeAdviceInterceptor(new WorldServiceBeforeAdvice());
  advisor.setAdvice(methodInterceptor);
  // the second aspect
  const advisor1 = new AspectJExpressionPointcutAdvisor();
  advisor1.setExpression(expression);
  const afterReturningAdviceInterceptor = new AfterReturningAdviceInterceptor(
    new WorldServiceAfterReturnAdvice(),
  );
  advisor1.setAdvice(afterReturningAdviceInterceptor);
  // obtain the proxy through a ProxyFactory
  const factory = new ProxyFactory();
  const targetSource = new TargetSource(worldService as object);
  factory.setTargetSource(targetSource);
  factory.setProxyTargetClass(true);
  factory.addAdvisor(advisor);
  factory.addAdvisor(advisor1);
  const proxy = factory.getProxy() as WorldService;
  // the two advisors run in the order they were added, around one join point
  expect(recordOutput(() => proxy.explode())).toEqual([
    'BeforeAdvice: do something before the earth explodes',
    'The null is going to explode',
    'AfterAdvice: do something after the earth explodes',
  ]);
});
