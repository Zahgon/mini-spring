/**
 * The AspectJ `execution()` pointcut, which decided which beans got proxied and
 * which methods got advised, and which aspectjweaver used to provide.
 *
 * The four expressions the repository configures are covered together with the
 * negatives that matter: if the class filter over-matches, unrelated beans get
 * wrapped in a proxy and the identity assertions of the circular-reference
 * tests stop holding.
 */

import { describe, expect, test } from 'vitest';
import {
  AspectJExpressionPointcut,
  UnsupportedPointcutPrimitiveException,
  classOf,
  type PointcutExpression,
} from '../../src/index.js';
import { A } from '../bean/A.js';
import { B } from '../bean/B.js';
import { C } from '../bean/C.js';
import { Car } from '../bean/Car.js';
import { HelloService } from '../service/HelloService.js';
import { WorldService } from '../service/WorldService.js';
import { WorldServiceImpl } from '../service/WorldServiceImpl.js';

const WORLD_SERVICE_EXPLODE =
  'execution(* org.springframework.test.service.WorldService.explode(..))';

describe('AspectJPointcutTest', () => {
  describe('the class filter', () => {
    test('matches a class that implements the named interface', () => {
      const pointcut = new AspectJExpressionPointcut(WORLD_SERVICE_EXPLODE);
      expect(pointcut.matches(classOf(WorldServiceImpl))).toBe(true);
      expect(pointcut.matches(WorldService)).toBe(true);
    });

    test('does not match an unrelated class', () => {
      const pointcut = new AspectJExpressionPointcut(WORLD_SERVICE_EXPLODE);
      expect(pointcut.matches(classOf(A))).toBe(false);
      expect(pointcut.matches(classOf(Car))).toBe(false);
    });

    test('a per-class expression matches only that class', () => {
      const pointcut = new AspectJExpressionPointcut(
        'execution(* org.springframework.test.bean.A.func(..))',
      );
      expect(pointcut.matches(classOf(A))).toBe(true);
      expect(pointcut.matches(classOf(B))).toBe(false);
      expect(pointcut.matches(classOf(C))).toBe(false);
    });

    test('a wildcard method pattern still restricts the type', () => {
      const pointcut = new AspectJExpressionPointcut(
        'execution(* org.springframework.test.bean.C.*(..))',
      );
      expect(pointcut.matches(classOf(C))).toBe(true);
      expect(pointcut.matches(classOf(A))).toBe(false);
      expect(pointcut.matches(classOf(B))).toBe(false);
    });
  });

  describe('the method matcher', () => {
    test('matches the override declared by the implementing class', () => {
      const pointcut = new AspectJExpressionPointcut(WORLD_SERVICE_EXPLODE);
      const impl = classOf(WorldServiceImpl);
      expect(pointcut.matches(impl.getDeclaredMethod('explode'), impl)).toBe(true);
    });

    test('does not match the other methods of the same class', () => {
      const pointcut = new AspectJExpressionPointcut(WORLD_SERVICE_EXPLODE);
      const impl = classOf(WorldServiceImpl);
      expect(pointcut.matches(impl.getDeclaredMethod('getName'), impl)).toBe(false);
      expect(pointcut.matches(impl.getDeclaredMethod('setName'), impl)).toBe(false);
    });

    test('a wildcard method pattern matches every method of the type', () => {
      const pointcut = new AspectJExpressionPointcut(
        'execution(* org.springframework.test.service.HelloService.*(..))',
      );
      const helloService = classOf(HelloService);
      expect(pointcut.matches(helloService.getDeclaredMethod('sayHello'), helloService)).toBe(true);
      expect(pointcut.matches(helloService.getDeclaredMethod('getBeanFactory'), helloService)).toBe(
        true,
      );
      const car = classOf(Car);
      expect(pointcut.matches(car.getDeclaredMethod('init'), car)).toBe(false);
    });

    test('a name wildcard does not cross the package separator', () => {
      const a = classOf(A);
      const func = a.getDeclaredMethod('func');
      // `*` matches within one name segment ...
      expect(
        new AspectJExpressionPointcut(
          'execution(* org.springframework.test.bean.*.func(..))',
        ).matches(func, a),
      ).toBe(true);
      expect(
        new AspectJExpressionPointcut('execution(* org.springframework.*.func(..))').matches(
          func,
          a,
        ),
      ).toBe(false);
      // ... and `..` crosses them.
      expect(
        new AspectJExpressionPointcut('execution(* org.springframework..*.func(..))').matches(
          func,
          a,
        ),
      ).toBe(true);
    });

    test('an argument list of the wrong arity does not match', () => {
      const zeroArgs = new AspectJExpressionPointcut(
        'execution(* org.springframework.test.service.WorldService.explode())',
      );
      const oneArg = new AspectJExpressionPointcut(
        'execution(* org.springframework.test.service.WorldService.explode(*))',
      );
      const impl = classOf(WorldServiceImpl);
      const explode = impl.getDeclaredMethod('explode');
      expect(zeroArgs.matches(explode, impl)).toBe(true);
      expect(oneArg.matches(explode, impl)).toBe(false);
    });

    test('modifiers in front of the return type are accepted', () => {
      const pointcut = new AspectJExpressionPointcut(
        'execution(public * org.springframework.test.bean.A.func(..))',
      );
      expect(pointcut.matches(classOf(A))).toBe(true);
    });
  });

  describe('the class filter is AspectJ\'s conservative fast match', () => {
    test('it ignores the argument list, unlike the method matcher', () => {
      // `explode(*)` advises no method of WorldServiceImpl, yet the class
      // filter still reports the type.
      const pointcut = new AspectJExpressionPointcut(
        'execution(* org.springframework.test.service.WorldService.explode(*))',
      );
      const impl = classOf(WorldServiceImpl);
      expect(pointcut.matches(impl)).toBe(true);
      expect(pointcut.matches(impl.getDeclaredMethod('explode'), impl)).toBe(false);
    });

    test('a wildcard in the type pattern makes it match every type', () => {
      const pointcut = new AspectJExpressionPointcut(
        'execution(* org.springframework.test.bean.*.func(..))',
      );
      for (const type of [A, B, C, Car, WorldServiceImpl, HelloService]) {
        expect(pointcut.matches(classOf(type))).toBe(true);
      }
      expect(pointcut.matches(WorldService)).toBe(true);
    });
  });

  test('only the execution primitive is supported, as in the original', () => {
    expect(
      () => new AspectJExpressionPointcut('within(org.springframework.test.bean.*)'),
    ).toThrow(UnsupportedPointcutPrimitiveException);
  });

  test('getClassFilter and getMethodMatcher return the pointcut itself', () => {
    const pointcut = new AspectJExpressionPointcut(WORLD_SERVICE_EXPLODE);
    expect(pointcut.getClassFilter()).toBe(pointcut);
    expect(pointcut.getMethodMatcher()).toBe(pointcut);
  });
});

describe('AspectJPointcutTest — the rest of the grammar', () => {
  test('a trailing + widens a type pattern to its subtypes', () => {
    const pointcut = new AspectJExpressionPointcut(
      'execution(* org.springframework.test.service.WorldService+.explode(..))',
    );
    const impl = classOf(WorldServiceImpl);
    expect(pointcut.matches(impl)).toBe(true);
    expect(pointcut.matches(classOf(HelloService))).toBe(false);
    expect(pointcut.matches(impl.getDeclaredMethod('explode'), impl)).toBe(true);
    expect(pointcut.matches(impl.getDeclaredMethod('setName'), impl)).toBe(false);
  });

  test('an argument list may name types', () => {
    const impl = classOf(WorldServiceImpl);
    const setName = impl.getDeclaredMethod('setName');
    const explode = impl.getDeclaredMethod('explode');
    const qualified = new AspectJExpressionPointcut(
      'execution(* org.springframework.test.service.WorldServiceImpl.setName(java.lang.String))',
    );
    expect(qualified.matches(setName, impl)).toBe(true);
    expect(qualified.matches(explode, impl)).toBe(false);
    expect(qualified.matches(impl)).toBe(true);

    const wrongType = new AspectJExpressionPointcut(
      'execution(* org.springframework.test.service.WorldServiceImpl.setName(java.lang.Integer))',
    );
    expect(wrongType.matches(setName, impl)).toBe(false);

    // java.lang is the one package AspectJ resolves unqualified names against
    const unqualified = new AspectJExpressionPointcut(
      'execution(* org.springframework.test.service.WorldServiceImpl.setName(String))',
    );
    expect(unqualified.matches(setName, impl)).toBe(true);
  });

  test('a ShadowMatch answers both ways round, and the expression is retained', () => {
    const expression = 'execution(* org.springframework.test.bean.C.*(..))';
    const pointcut = new AspectJExpressionPointcut(expression);
    const c = classOf(C);
    const sayHello = c.getDeclaredMethod('sayHello');
    const engine = (pointcut as unknown as { pointcutExpression: PointcutExpression })
      .pointcutExpression;
    expect(engine.getPointcutExpression()).toEqual(expression);
    expect(engine.matchesMethodExecution(sayHello).alwaysMatches()).toBe(true);
    expect(engine.matchesMethodExecution(sayHello).neverMatches()).toBe(false);
    const car = classOf(Car);
    expect(engine.matchesMethodExecution(car.getDeclaredMethod('init')).neverMatches()).toBe(true);
  });
});
