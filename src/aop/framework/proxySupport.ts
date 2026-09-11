/**
 * The machinery both proxy strategies share.
 *
 * CGLIB generates a subclass and the JDK generates a class implementing the
 * target's interfaces; a JavaScript `Proxy` covers both. What differs is which
 * members the proxy exposes — the JDK proxy exposes the interfaces' methods and
 * nothing else — and that difference is preserved.
 */

import { getClass, registerProxyClass, type JavaClass, type JavaMethod } from '../../deps/java/lang/Class.js';

export type ProxyInterceptor = (method: JavaMethod, args: unknown[]) => unknown;

export function createProxy(
  target: object,
  exposedType: JavaClass,
  methods: Map<string, JavaMethod>,
  intercept: ProxyInterceptor,
): object {
  const proxy = new Proxy(target, {
    get(t: object, property: string | symbol): unknown {
      if (typeof property !== 'string') {
        return Reflect.get(t, property);
      }
      const method = methods.get(property);
      if (method === undefined) {
        return Reflect.get(t, property);
      }
      return (...args: unknown[]): unknown => intercept(method, args);
    },
  });
  registerProxyClass(proxy, exposedType);
  return proxy;
}

/** The methods a JDK proxy exposes: those declared by the given interfaces. */
export function interfaceMethods(interfaces: readonly JavaClass[]): Map<string, JavaMethod> {
  const methods = new Map<string, JavaMethod>();
  for (const iface of interfaces) {
    for (const [name, method] of iface.getMethods()) {
      if (!methods.has(name)) {
        methods.set(name, method);
      }
    }
  }
  return methods;
}

/** The methods a CGLIB subclass exposes: every method of the target class. */
export function targetClassMethods(target: object): Map<string, JavaMethod> {
  return getClass(target).getMethods();
}
