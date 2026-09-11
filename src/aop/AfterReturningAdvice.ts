import { declareInterface, type JavaMethod } from '../deps/java/lang/Class.js';
import { AfterAdvice } from './AfterAdvice.js';

/**
 * Advice that runs after the join point returns
 *
 * @author zqc
 * @date 2022/12/16
 */
export interface AfterReturningAdvice extends AfterAdvice {
  afterReturning(returnValue: unknown, method: JavaMethod, args: unknown[], target: unknown): void;
}

export const AfterReturningAdvice = declareInterface(
  'org.springframework.aop.AfterReturningAdvice',
  { implements: [AfterAdvice] },
);
