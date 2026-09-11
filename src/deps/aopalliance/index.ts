/**
 * The AOP Alliance interfaces (`aopalliance:aopalliance:1.0`).
 *
 * `Advice` is a *marker* interface — no members at all — and
 * `DefaultAdvisorAutoProxyCreator` uses `Advice.class.isAssignableFrom(...)` to
 * decide whether a bean is infrastructure and must not be proxied. Structural
 * typing cannot see an empty interface, so each one is also declared as a
 * runtime type.
 */

import { declareInterface } from '../java/lang/Class.js';
import type { JavaMethod } from '../java/lang/Class.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Advice {}
export const Advice = declareInterface('org.aopalliance.aop.Advice');

export interface Joinpoint {
  proceed(): unknown;
  getThis(): unknown;
  getStaticPart(): unknown;
}
export const Joinpoint = declareInterface('org.aopalliance.intercept.Joinpoint');

export interface Invocation extends Joinpoint {
  getArguments(): unknown[];
}
export const Invocation = declareInterface('org.aopalliance.intercept.Invocation', {
  implements: [Joinpoint],
});

export interface MethodInvocation extends Invocation {
  getMethod(): JavaMethod;
}
export const MethodInvocation = declareInterface('org.aopalliance.intercept.MethodInvocation', {
  implements: [Invocation],
});

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Interceptor extends Advice {}
export const Interceptor = declareInterface('org.aopalliance.intercept.Interceptor', {
  implements: [Advice],
});

export interface MethodInterceptor extends Interceptor {
  invoke(invocation: MethodInvocation): unknown;
}
export const MethodInterceptor = declareInterface('org.aopalliance.intercept.MethodInterceptor', {
  implements: [Interceptor],
});
