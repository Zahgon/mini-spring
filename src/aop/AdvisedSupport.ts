import { Reflectable, type JavaClass, type JavaMethod } from '../deps/java/lang/Class.js';
import { JavaConcurrentHashMap } from '../deps/java/util/HashMap.js';
import type { AdvisorChainFactory } from './framework/AdvisorChainFactory.js';
import { DefaultAdvisorChainFactory } from './framework/DefaultAdvisorChainFactory.js';
import type { Advisor } from './Advisor.js';
import type { MethodMatcher } from './MethodMatcher.js';
import type { TargetSource } from './TargetSource.js';

/**
 * @author zqc
 * @date 2022/12/16
 */
@Reflectable('org.springframework.aop.AdvisedSupport')
export class AdvisedSupport {
  // whether to use a CGLIB proxy
  private proxyTargetClass = true;

  private targetSource!: TargetSource;

  private methodMatcher!: MethodMatcher;

  private readonly methodCache = new JavaConcurrentHashMap<number, unknown[]>(32);

  advisorChainFactory: AdvisorChainFactory = new DefaultAdvisorChainFactory();

  private readonly advisors: Advisor[] = [];

  isProxyTargetClass(): boolean {
    return this.proxyTargetClass;
  }

  setProxyTargetClass(proxyTargetClass: boolean): void {
    this.proxyTargetClass = proxyTargetClass;
  }

  addAdvisor(advisor: Advisor): void {
    this.advisors.push(advisor);
  }

  getAdvisors(): Advisor[] {
    return this.advisors;
  }

  getTargetSource(): TargetSource {
    return this.targetSource;
  }

  setTargetSource(targetSource: TargetSource): void {
    this.targetSource = targetSource;
  }

  getMethodMatcher(): MethodMatcher {
    return this.methodMatcher;
  }

  setMethodMatcher(methodMatcher: MethodMatcher): void {
    this.methodMatcher = methodMatcher;
  }

  /**
   * Returns the interceptor chain for a method.
   */
  getInterceptorsAndDynamicInterceptionAdvice(
    method: JavaMethod,
    targetClass: JavaClass | null,
  ): unknown[] {
    const cacheKey = method.hashCode();
    let cached = this.methodCache.get(cacheKey);
    if (cached === undefined) {
      cached = this.advisorChainFactory.getInterceptorsAndDynamicInterceptionAdvice(
        this,
        method,
        targetClass,
      );
      this.methodCache.put(cacheKey, cached);
    }
    return cached;
  }
}
