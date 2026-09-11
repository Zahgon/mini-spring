/**
 * `java.util.HashMap` and `java.util.HashSet`, reproduced for their
 * **iteration order**.
 *
 * The container prints from inside loops over these collections, so bucket
 * order is user-visible output, not an implementation detail. The clearest
 * case is `DefaultAdvisorAutoProxyCreator`: `getBeansOfType(...)` fills a
 * `HashMap` in `ConcurrentHashMap` order and the caller then consumes
 * `.values()`, which re-orders the two advisors of `auto-proxy.xml` so that
 * the before-advice runs ahead of the after-advice. A JavaScript `Map`, which
 * is insertion-ordered, gets that backwards.
 *
 * Table sizing, the `h ^ (h >>> 16)` spread, the 0.75 load factor and the
 * order-preserving lo/hi split on resize are all as in the JDK. Treeification
 * (8 nodes in one bin) is not implemented: it cannot be reached here, and a
 * tree bin would change iteration order, so it throws rather than diverging.
 */

import { stringHashCode } from '../lang/Class.js';

const DEFAULT_INITIAL_CAPACITY = 16;
const LOAD_FACTOR = 0.75;
const TREEIFY_THRESHOLD = 8;

interface Node<K, V> {
  readonly hash: number;
  readonly key: K;
  value: V;
  next: Node<K, V> | null;
}

const IDENTITY_HASHES = new WeakMap<object, number>();
let identityHashSeed = 0x2b3c4d;

/**
 * `Object.hashCode()`. Java's identity hash is unspecified, so any collection
 * ordered by it is unordered in the original too; a stable counter keeps the
 * port deterministic without claiming to match a specific JVM run.
 */
function identityHashCode(value: object): number {
  let hash = IDENTITY_HASHES.get(value);
  if (hash === undefined) {
    identityHashSeed = (Math.imul(identityHashSeed, 1664525) + 1013904223) | 0;
    hash = identityHashSeed >>> 4;
    IDENTITY_HASHES.set(value, hash);
  }
  return hash;
}

/** `Objects.hashCode(key)` for the key types this container actually uses. */
export function javaHashCode(key: unknown): number {
  switch (typeof key) {
    case 'string':
      return stringHashCode(key);
    case 'number':
      return key | 0;
    case 'boolean':
      return key ? 1231 : 1237;
    case 'object':
      break;
    default:
      return 0;
  }
  if (key === null) {
    return 0;
  }
  const candidate = key as { hashCode?: () => number };
  if (typeof candidate.hashCode === 'function') {
    return candidate.hashCode() | 0;
  }
  return identityHashCode(key as object);
}

/** `Objects.equals(a, b)`. */
export function javaEquals(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (a === null || a === undefined || typeof a !== 'object') {
    return false;
  }
  const candidate = a as { equals?: (other: unknown) => boolean };
  return typeof candidate.equals === 'function' && candidate.equals(b);
}

function tableSizeFor(capacity: number): number {
  let size = 1;
  while (size < capacity) {
    size <<= 1;
  }
  return Math.max(1, size);
}

/** `HashMap.hash(key)`. */
function spread(hash: number): number {
  return (hash ^ (hash >>> 16)) | 0;
}

export class JavaHashMap<K, V> {
  private table: (Node<K, V> | null)[];
  private threshold: number;
  private count = 0;

  constructor(initialCapacity: number = DEFAULT_INITIAL_CAPACITY) {
    const capacity = tableSizeFor(initialCapacity);
    this.table = new Array<Node<K, V> | null>(capacity).fill(null);
    this.threshold = Math.floor(capacity * LOAD_FACTOR);
  }

  get size(): number {
    return this.count;
  }

  get(key: K): V | undefined {
    const node = this.findNode(key);
    return node === null ? undefined : node.value;
  }

  containsKey(key: K): boolean {
    return this.findNode(key) !== null;
  }

  put(key: K, value: V): V | undefined {
    const hash = spread(javaHashCode(key));
    const index = hash & (this.table.length - 1);
    let node = this.table[index] ?? null;
    let binSize = 0;
    let previous: Node<K, V> | null = null;
    while (node !== null) {
      if (node.hash === hash && javaEquals(node.key, key)) {
        const old = node.value;
        node.value = value;
        return old;
      }
      previous = node;
      node = node.next;
      binSize++;
    }
    const created: Node<K, V> = { hash, key, value, next: null };
    if (previous === null) {
      this.table[index] = created;
    } else {
      previous.next = created;
    }
    if (binSize + 1 >= TREEIFY_THRESHOLD && this.table.length >= 64) {
      throw new Error('HashMap bin treeification is not reproduced');
    }
    if (++this.count > this.threshold) {
      this.resize();
    }
    return undefined;
  }

  remove(key: K): V | undefined {
    const hash = spread(javaHashCode(key));
    const index = hash & (this.table.length - 1);
    let node = this.table[index] ?? null;
    let previous: Node<K, V> | null = null;
    while (node !== null) {
      if (node.hash === hash && javaEquals(node.key, key)) {
        if (previous === null) {
          this.table[index] = node.next;
        } else {
          previous.next = node.next;
        }
        this.count--;
        return node.value;
      }
      previous = node;
      node = node.next;
    }
    return undefined;
  }

  keys(): K[] {
    return [...this].map(([key]) => key);
  }

  values(): V[] {
    return [...this].map(([, value]) => value);
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const [key, value] of this) {
      callback(value, key);
    }
  }

  *[Symbol.iterator](): IterableIterator<[K, V]> {
    for (const bin of this.table) {
      let node = bin;
      while (node !== null && node !== undefined) {
        yield [node.key, node.value];
        node = node.next;
      }
    }
  }

  private findNode(key: K): Node<K, V> | null {
    const hash = spread(javaHashCode(key));
    let node = this.table[hash & (this.table.length - 1)] ?? null;
    while (node !== null) {
      if (node.hash === hash && javaEquals(node.key, key)) {
        return node;
      }
      node = node.next;
    }
    return null;
  }

  /** `HashMap.resize()`: each bin splits in two, relative order preserved. */
  private resize(): void {
    const oldTable = this.table;
    const oldCapacity = oldTable.length;
    const newCapacity = oldCapacity << 1;
    const newTable = new Array<Node<K, V> | null>(newCapacity).fill(null);
    for (let index = 0; index < oldCapacity; index++) {
      let node = oldTable[index] ?? null;
      let loHead: Node<K, V> | null = null;
      let loTail: Node<K, V> | null = null;
      let hiHead: Node<K, V> | null = null;
      let hiTail: Node<K, V> | null = null;
      while (node !== null) {
        const next = node.next;
        node.next = null;
        if ((node.hash & oldCapacity) === 0) {
          if (loTail === null) {
            loHead = node;
          } else {
            loTail.next = node;
          }
          loTail = node;
        } else {
          if (hiTail === null) {
            hiHead = node;
          } else {
            hiTail.next = node;
          }
          hiTail = node;
        }
        node = next;
      }
      newTable[index] = loHead;
      newTable[index + oldCapacity] = hiHead;
    }
    this.table = newTable;
    this.threshold = Math.floor(newCapacity * LOAD_FACTOR);
  }
}

/** `java.util.HashSet`, which is a `HashMap` with a constant value. */
export class JavaHashSet<E> implements Iterable<E> {
  private readonly map = new JavaHashMap<E, true>();

  get size(): number {
    return this.map.size;
  }

  add(element: E): boolean {
    return this.map.put(element, true) === undefined;
  }

  remove(element: E): boolean {
    return this.map.remove(element) !== undefined;
  }

  contains(element: E): boolean {
    return this.map.containsKey(element);
  }

  [Symbol.iterator](): IterableIterator<E> {
    return this.map.keys()[Symbol.iterator]();
  }
}

/**
 * `java.util.concurrent.ConcurrentHashMap`, again for iteration order.
 *
 * It differs from `HashMap` in two ways that matter: the capacity implied by
 * `new ConcurrentHashMap<>(n)` is `tableSizeFor(n + (n >>> 1) + 1)`, and the
 * spread masks off the sign bit.
 */
export class JavaConcurrentHashMap<K, V> {
  private table: (Node<K, V> | null)[];
  private threshold: number;
  private count = 0;

  constructor(initialCapacity?: number) {
    const capacity =
      initialCapacity === undefined
        ? DEFAULT_INITIAL_CAPACITY
        : tableSizeFor(initialCapacity + (initialCapacity >>> 1) + 1);
    this.table = new Array<Node<K, V> | null>(capacity).fill(null);
    this.threshold = capacity - (capacity >>> 2);
  }

  get size(): number {
    return this.count;
  }

  get(key: K): V | undefined {
    const hash = concurrentSpread(javaHashCode(key));
    let node = this.table[hash & (this.table.length - 1)] ?? null;
    while (node !== null) {
      if (node.hash === hash && javaEquals(node.key, key)) {
        return node.value;
      }
      node = node.next;
    }
    return undefined;
  }

  containsKey(key: K): boolean {
    return this.get(key) !== undefined;
  }

  put(key: K, value: V): V | undefined {
    const hash = concurrentSpread(javaHashCode(key));
    const index = hash & (this.table.length - 1);
    let node = this.table[index] ?? null;
    let previous: Node<K, V> | null = null;
    while (node !== null) {
      if (node.hash === hash && javaEquals(node.key, key)) {
        const old = node.value;
        node.value = value;
        return old;
      }
      previous = node;
      node = node.next;
    }
    const created: Node<K, V> = { hash, key, value, next: null };
    if (previous === null) {
      this.table[index] = created;
    } else {
      previous.next = created;
    }
    if (++this.count >= this.threshold) {
      this.resize();
    }
    return undefined;
  }

  remove(key: K): V | undefined {
    const hash = concurrentSpread(javaHashCode(key));
    const index = hash & (this.table.length - 1);
    let node = this.table[index] ?? null;
    let previous: Node<K, V> | null = null;
    while (node !== null) {
      if (node.hash === hash && javaEquals(node.key, key)) {
        if (previous === null) {
          this.table[index] = node.next;
        } else {
          previous.next = node.next;
        }
        this.count--;
        return node.value;
      }
      previous = node;
      node = node.next;
    }
    return undefined;
  }

  keys(): K[] {
    return [...this].map(([key]) => key);
  }

  values(): V[] {
    return [...this].map(([, value]) => value);
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const [key, value] of this) {
      callback(value, key);
    }
  }

  *[Symbol.iterator](): IterableIterator<[K, V]> {
    for (const bin of this.table) {
      let node = bin;
      while (node !== null && node !== undefined) {
        yield [node.key, node.value];
        node = node.next;
      }
    }
  }

  /** `ConcurrentHashMap.transfer()`, including its `lastRun` reversal. */
  private resize(): void {
    const oldTable = this.table;
    const oldCapacity = oldTable.length;
    const newCapacity = oldCapacity << 1;
    const newTable = new Array<Node<K, V> | null>(newCapacity).fill(null);
    for (let index = 0; index < oldCapacity; index++) {
      const head = oldTable[index] ?? null;
      if (head === null) {
        continue;
      }
      let runBit = head.hash & oldCapacity;
      let lastRun = head;
      for (let node = head.next; node !== null; node = node.next) {
        const bit = node.hash & oldCapacity;
        if (bit !== runBit) {
          runBit = bit;
          lastRun = node;
        }
      }
      let lo: Node<K, V> | null = runBit === 0 ? lastRun : null;
      let hi: Node<K, V> | null = runBit === 0 ? null : lastRun;
      for (let node: Node<K, V> | null = head; node !== null && node !== lastRun; node = node.next) {
        const copy: Node<K, V> = { hash: node.hash, key: node.key, value: node.value, next: null };
        if ((node.hash & oldCapacity) === 0) {
          copy.next = lo;
          lo = copy;
        } else {
          copy.next = hi;
          hi = copy;
        }
      }
      newTable[index] = lo;
      newTable[index + oldCapacity] = hi;
    }
    this.table = newTable;
    this.threshold = newCapacity - (newCapacity >>> 2);
  }
}

/** `ConcurrentHashMap.spread(h)`. */
function concurrentSpread(hash: number): number {
  return (hash ^ (hash >>> 16)) & 0x7fffffff;
}
