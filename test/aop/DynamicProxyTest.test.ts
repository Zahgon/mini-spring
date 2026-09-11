/**
 * @author derekyi
 * @date 2020/12/6
 */
import { beforeEach, expect, test } from 'vitest';
import {
  AdvisedSupport,
  AfterReturningAdviceInterceptor,
  AspectJExpressionPointcutAdvisor,
  CglibAopProxy,
  JdkDynamicAopProxy,
  MethodBeforeAdviceInterceptor,
  ProxyFactory,
  TargetSource,
  getClass,
  type ClassFilter,
} from '../../src/index.js';
import { recordOutput } from '../support/output.js';
import { WorldServiceAfterReturnAdvice } from '../common/WorldServiceAfterReturnAdvice.js';
import { WorldServiceBeforeAdvice } from '../common/WorldServiceBeforeAdvice.js';
import type { WorldService } from '../service/WorldService.js';
import { WorldServiceImpl } from '../service/WorldServiceImpl.js';

let advisedSupport: AdvisedSupport;

beforeEach(() => {
  const worldService: WorldService = new WorldServiceImpl();
  advisedSupport = new ProxyFactory();
  // an Advisor is a Pointcut and an Advice together
  const expression = 'execution(* org.springframework.test.service.WorldService.explode(..))';
  const advisor = new AspectJExpressionPointcutAdvisor();
  advisor.setExpression(expression);
  const methodInterceptor = new AfterReturningAdviceInterceptor(
    new WorldServiceAfterReturnAdvice(),
  );
  advisor.setAdvice(methodInterceptor);
  const targetSource = new TargetSource(worldService as object);
  advisedSupport.setTargetSource(targetSource);
  advisedSupport.addAdvisor(advisor);
});

test('testJdkDynamicProxy', () => {
  const proxy = new JdkDynamicAopProxy(advisedSupport).getProxy() as WorldService;
  expect(recordOutput(() => proxy.explode())).toEqual([
    'The null is going to explode',
    'AfterAdvice: do something after the earth explodes',
  ]);
});

test('testCglibDynamicProxy', () => {
  const proxy = new CglibAopProxy(advisedSupport).getProxy() as WorldService;
  expect(recordOutput(() => proxy.explode())).toEqual([
    'The null is going to explode',
    'AfterAdvice: do something after the earth explodes',
  ]);
});

test('testProxyFactory', () => {
  // use a JDK dynamic proxy
  const factory = advisedSupport as ProxyFactory;
  factory.setProxyTargetClass(false);
  let proxy = factory.getProxy() as WorldService;
  const jdk = recordOutput(() => proxy.explode());

  // use a CGLIB dynamic proxy
  factory.setProxyTargetClass(true);
  proxy = factory.getProxy() as WorldService;
  const cglib = recordOutput(() => proxy.explode());

  // both strategies advise the same join point the same way
  expect(jdk).toEqual(['The null is going to explode', 'AfterAdvice: do something after the earth explodes']);
  expect(cglib).toEqual(jdk);
});

test('testBeforeAdvice', () => {
  // install a BeforeAdvice
  const expression = 'execution(* org.springframework.test.service.WorldService.explode(..))';
  const advisor = new AspectJExpressionPointcutAdvisor();
  advisor.setExpression(expression);
  const methodInterceptor = new MethodBeforeAdviceInterceptor(new WorldServiceBeforeAdvice());
  advisor.setAdvice(methodInterceptor);
  advisedSupport.addAdvisor(advisor);
  const factory = advisedSupport as ProxyFactory;
  const proxy = factory.getProxy() as WorldService;
  expect(recordOutput(() => proxy.explode())).toEqual([
    'BeforeAdvice: do something before the earth explodes',
    'The null is going to explode',
    'AfterAdvice: do something after the earth explodes',
  ]);
});

test('testAdvisor', () => {
  const worldService: WorldService = new WorldServiceImpl();

  // an Advisor is a Pointcut and an Advice together
  const expression = 'execution(* org.springframework.test.service.WorldService.explode(..))';
  const advisor = new AspectJExpressionPointcutAdvisor();
  advisor.setExpression(expression);
  const methodInterceptor = new MethodBeforeAdviceInterceptor(new WorldServiceBeforeAdvice());
  advisor.setAdvice(methodInterceptor);

  const classFilter: ClassFilter = advisor.getPointcut().getClassFilter();
  if (classFilter.matches(getClass(worldService as object))) {
    const proxyFactory = new ProxyFactory();

    const targetSource = new TargetSource(worldService as object);
    proxyFactory.setTargetSource(targetSource);
    proxyFactory.addAdvisor(advisor);
    // proxyFactory.setMethodMatcher(advisor.getPointcut().getMethodMatcher());
    // advisedSupport.setProxyTargetClass(true);   // JDK or CGLIB

    const proxy = proxyFactory.getProxy() as WorldService;
    expect(recordOutput(() => proxy.explode())).toEqual([
      'BeforeAdvice: do something before the earth explodes',
      'The null is going to explode',
    ]);
  }
});
