/**
 * The iteration order of `java.util.HashMap`, `java.util.HashSet` and
 * `java.util.concurrent.ConcurrentHashMap`.
 *
 * The container prints from inside loops over these collections, so their order
 * is user-visible output. It used to be the JDK's problem and is now this
 * repository's, which is what these tests are for. Every expected value below
 * was captured from the JDK itself (OpenJDK 11), not derived from this
 * implementation, and the sizes deliberately cross the 0.75 load factor so the
 * order-preserving resize paths are exercised.
 */

import { describe, expect, test } from 'vitest';
import {
  JavaConcurrentHashMap,
  JavaHashMap,
  JavaHashSet,
  classOf,
  stringHashCode,
} from '../../src/index.js';
import { WorldServiceImpl } from '../service/WorldServiceImpl.js';

const KEYS = [
  ...Array.from({ length: 40 }, (_, i) => `bean${String(i)}`),
  'person',
  'car',
  'helloService',
  'customBeanFactoryPostProcessor',
  'customerBeanPostProcessor',
  'pointcutAdvisor',
  'pointcutAdvisor2',
  'worldService',
  'defaultAdvisorAutoProxyCreator',
  'methodInterceptor',
  'methodInterceptor2',
  'afterAdvice',
  'beforeAdvice',
  'a',
  'b',
  'c',
  'conversionService',
  'converters',
  'contextRefreshedEventListener',
  'customEventListener',
  'contextClosedEventListener',
];

const INTEGER_ORDER = [0, 118785, 237570, 87109, 205894, 174218, 55433, 142542, 261327, 23757, 293003, 229651, 110866, 197975, 79190, 285084, 166299, 47514, 134623, 15838, 102947, 253408, 71271, 221732, 277165, 190056, 39595, 308841, 158380, 7919, 126704, 245489, 95028, 213813, 63352, 269246, 182137, 31676, 300922, 150461];

const CHM32_ORDER = ["bean29", "bean28", "worldService", "bean27", "bean26", "bean25", "bean24", "bean23", "bean22", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean21", "bean20", "afterAdvice", "converters", "bean8", "bean9", "bean18", "bean17", "bean16", "bean15", "bean14", "bean13", "bean12", "bean11", "bean19", "contextClosedEventListener", "person", "bean10", "conversionService", "beforeAdvice", "car", "helloService", "methodInterceptor2", "bean39", "a", "bean38", "b", "bean37", "c", "customEventListener", "bean36", "bean35", "bean34", "bean33", "customerBeanPostProcessor", "defaultAdvisorAutoProxyCreator", "contextRefreshedEventListener", "pointcutAdvisor", "pointcutAdvisor2", "customBeanFactoryPostProcessor", "methodInterceptor", "bean32", "bean31", "bean30"];

describe('JavaCollectionsTest', () => {
  describe('iteration order matches the JDK', () => {
    test('3 entries', () => {
      const hashMap = new JavaHashMap<string, number>();
      const concurrent = new JavaConcurrentHashMap<string, number>(256);
      const hashSet = new JavaHashSet<string>();
      for (let i = 0; i < 3; i++) {
        hashMap.put(KEYS[i]!, i);
        concurrent.put(KEYS[i]!, i);
        hashSet.add(KEYS[i]!);
      }
      expect(hashMap.keys()).toEqual(["bean0", "bean1", "bean2"]);
      expect(concurrent.keys()).toEqual(["bean0", "bean1", "bean2"]);
      expect([...hashSet]).toEqual(["bean0", "bean1", "bean2"]);
    });
    test('8 entries', () => {
      const hashMap = new JavaHashMap<string, number>();
      const concurrent = new JavaConcurrentHashMap<string, number>(256);
      const hashSet = new JavaHashSet<string>();
      for (let i = 0; i < 8; i++) {
        hashMap.put(KEYS[i]!, i);
        concurrent.put(KEYS[i]!, i);
        hashSet.add(KEYS[i]!);
      }
      expect(hashMap.keys()).toEqual(["bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3"]);
      expect(concurrent.keys()).toEqual(["bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3"]);
      expect([...hashSet]).toEqual(["bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3"]);
    });
    test('13 entries', () => {
      const hashMap = new JavaHashMap<string, number>();
      const concurrent = new JavaConcurrentHashMap<string, number>(256);
      const hashSet = new JavaHashSet<string>();
      for (let i = 0; i < 13; i++) {
        hashMap.put(KEYS[i]!, i);
        concurrent.put(KEYS[i]!, i);
        hashSet.add(KEYS[i]!);
      }
      expect(hashMap.keys()).toEqual(["bean12", "bean11", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean10", "bean8", "bean9"]);
      expect(concurrent.keys()).toEqual(["bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean8", "bean9", "bean12", "bean11", "bean10"]);
      expect([...hashSet]).toEqual(["bean12", "bean11", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean10", "bean8", "bean9"]);
    });
    test('20 entries', () => {
      const hashMap = new JavaHashMap<string, number>();
      const concurrent = new JavaConcurrentHashMap<string, number>(256);
      const hashSet = new JavaHashSet<string>();
      for (let i = 0; i < 20; i++) {
        hashMap.put(KEYS[i]!, i);
        concurrent.put(KEYS[i]!, i);
        hashSet.add(KEYS[i]!);
      }
      expect(hashMap.keys()).toEqual(["bean18", "bean17", "bean16", "bean15", "bean14", "bean13", "bean12", "bean11", "bean19", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean10", "bean8", "bean9"]);
      expect(concurrent.keys()).toEqual(["bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean8", "bean9", "bean18", "bean17", "bean16", "bean15", "bean14", "bean13", "bean12", "bean11", "bean19", "bean10"]);
      expect([...hashSet]).toEqual(["bean18", "bean17", "bean16", "bean15", "bean14", "bean13", "bean12", "bean11", "bean19", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean10", "bean8", "bean9"]);
    });
    test('40 entries', () => {
      const hashMap = new JavaHashMap<string, number>();
      const concurrent = new JavaConcurrentHashMap<string, number>(256);
      const hashSet = new JavaHashSet<string>();
      for (let i = 0; i < 40; i++) {
        hashMap.put(KEYS[i]!, i);
        concurrent.put(KEYS[i]!, i);
        hashSet.add(KEYS[i]!);
      }
      expect(hashMap.keys()).toEqual(["bean29", "bean28", "bean27", "bean26", "bean25", "bean24", "bean23", "bean22", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean21", "bean20", "bean8", "bean9", "bean18", "bean17", "bean39", "bean16", "bean38", "bean15", "bean37", "bean14", "bean36", "bean13", "bean35", "bean12", "bean34", "bean11", "bean33", "bean19", "bean10", "bean32", "bean31", "bean30"]);
      expect(concurrent.keys()).toEqual(["bean39", "bean38", "bean37", "bean36", "bean35", "bean34", "bean33", "bean32", "bean31", "bean30", "bean29", "bean28", "bean27", "bean26", "bean25", "bean24", "bean23", "bean22", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean21", "bean20", "bean8", "bean9", "bean18", "bean17", "bean16", "bean15", "bean14", "bean13", "bean12", "bean11", "bean19", "bean10"]);
      expect([...hashSet]).toEqual(["bean29", "bean28", "bean27", "bean26", "bean25", "bean24", "bean23", "bean22", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean21", "bean20", "bean8", "bean9", "bean18", "bean17", "bean39", "bean16", "bean38", "bean15", "bean37", "bean14", "bean36", "bean13", "bean35", "bean12", "bean34", "bean11", "bean33", "bean19", "bean10", "bean32", "bean31", "bean30"]);
    });
    test('61 entries', () => {
      const hashMap = new JavaHashMap<string, number>();
      const concurrent = new JavaConcurrentHashMap<string, number>(256);
      const hashSet = new JavaHashSet<string>();
      for (let i = 0; i < 61; i++) {
        hashMap.put(KEYS[i]!, i);
        concurrent.put(KEYS[i]!, i);
        hashSet.add(KEYS[i]!);
      }
      expect(hashMap.keys()).toEqual(["bean29", "bean28", "worldService", "bean27", "bean26", "bean25", "bean24", "bean23", "bean22", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean21", "bean20", "afterAdvice", "converters", "bean8", "bean9", "bean18", "bean17", "bean16", "bean15", "bean14", "bean13", "bean12", "bean11", "bean19", "contextClosedEventListener", "person", "bean10", "conversionService", "beforeAdvice", "car", "helloService", "methodInterceptor2", "bean39", "a", "bean38", "b", "bean37", "c", "customEventListener", "bean36", "bean35", "bean34", "bean33", "customerBeanPostProcessor", "defaultAdvisorAutoProxyCreator", "contextRefreshedEventListener", "pointcutAdvisor", "pointcutAdvisor2", "customBeanFactoryPostProcessor", "methodInterceptor", "bean32", "bean31", "bean30"]);
      expect(concurrent.keys()).toEqual(["afterAdvice", "a", "b", "c", "contextRefreshedEventListener", "pointcutAdvisor2", "customBeanFactoryPostProcessor", "conversionService", "methodInterceptor2", "bean39", "bean38", "bean37", "customEventListener", "bean36", "bean35", "bean34", "bean33", "defaultAdvisorAutoProxyCreator", "pointcutAdvisor", "bean32", "bean31", "bean30", "bean29", "bean28", "worldService", "bean27", "bean26", "bean25", "bean24", "bean23", "bean22", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean21", "bean20", "converters", "bean8", "bean9", "bean18", "bean17", "bean16", "bean15", "bean14", "bean13", "bean12", "bean11", "bean19", "bean10", "customerBeanPostProcessor", "contextClosedEventListener", "person", "beforeAdvice", "car", "helloService", "methodInterceptor"]);
      expect([...hashSet]).toEqual(["bean29", "bean28", "worldService", "bean27", "bean26", "bean25", "bean24", "bean23", "bean22", "bean4", "bean5", "bean6", "bean7", "bean0", "bean1", "bean2", "bean3", "bean21", "bean20", "afterAdvice", "converters", "bean8", "bean9", "bean18", "bean17", "bean16", "bean15", "bean14", "bean13", "bean12", "bean11", "bean19", "contextClosedEventListener", "person", "bean10", "conversionService", "beforeAdvice", "car", "helloService", "methodInterceptor2", "bean39", "a", "bean38", "b", "bean37", "c", "customEventListener", "bean36", "bean35", "bean34", "bean33", "customerBeanPostProcessor", "defaultAdvisorAutoProxyCreator", "contextRefreshedEventListener", "pointcutAdvisor", "pointcutAdvisor2", "customBeanFactoryPostProcessor", "methodInterceptor", "bean32", "bean31", "bean30"]);
    });
  });

  test('String.hashCode', () => {
    expect(stringHashCode('')).toEqual(0);
    expect(stringHashCode('car')).toEqual(98260);
    expect(stringHashCode('person')).toEqual(-991716523);
    expect(stringHashCode('helloService')).toEqual(1583289731);
  });

  test('Method.hashCode, the key AdvisedSupport.methodCache uses', () => {
    const worldServiceImpl = classOf(WorldServiceImpl);
    expect(worldServiceImpl.getDeclaredMethod('explode').hashCode()).toEqual(863367056);
    expect(worldServiceImpl.getDeclaredMethod('getName').hashCode()).toEqual(2030105712);
    expect(worldServiceImpl.getDeclaredMethod('setName').hashCode()).toEqual(-187712132);
  });

  test('an integer-keyed map iterates in the JDK order too', () => {
    const hashMap = new JavaHashMap<number, string>();
    const concurrent = new JavaConcurrentHashMap<number, string>(32);
    for (let i = 0; i < 40; i++) {
      hashMap.put(i * 7919, 'v');
      concurrent.put(i * 7919, 'v');
    }
    expect(hashMap.keys()).toEqual(INTEGER_ORDER);
    expect(concurrent.keys()).toEqual(INTEGER_ORDER);
  });

  test('ConcurrentHashMap(32) sizes its table from n + (n >>> 1) + 1', () => {
    const chm32 = new JavaConcurrentHashMap<string, number>(32);
    for (let i = 0; i < 61; i++) {
      chm32.put(KEYS[i]!, i);
    }
    expect(chm32.keys()).toEqual(CHM32_ORDER);
  });

  test('put replaces in place and remove unlinks', () => {
    const map = new JavaHashMap<string, number>();
    map.put('a', 1);
    map.put('b', 2);
    expect(map.put('a', 3)).toEqual(1);
    expect(map.get('a')).toEqual(3);
    expect(map.size).toEqual(2);
    expect(map.keys()).toEqual(['a', 'b']);
    expect(map.remove('a')).toEqual(3);
    expect(map.remove('a')).toBeUndefined();
    expect(map.size).toEqual(1);
    expect(map.containsKey('a')).toBe(false);
  });

  test('HashSet.add reports whether the element was new', () => {
    const set = new JavaHashSet<string>();
    expect(set.add('x')).toBe(true);
    expect(set.add('x')).toBe(false);
    expect(set.contains('x')).toBe(true);
    expect(set.remove('x')).toBe(true);
    expect(set.remove('x')).toBe(false);
  });
});
