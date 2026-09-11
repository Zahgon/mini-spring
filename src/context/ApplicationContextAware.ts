import { declareInterface } from '../deps/java/lang/Class.js';
import { Aware } from '../beans/factory/Aware.js';
import type { ApplicationContext } from './ApplicationContext.js';

/**
 * Implementing it makes a bean aware of the ApplicationContext that owns it.
 *
 * @author derekyi
 * @date 2020/12/1
 */
export interface ApplicationContextAware extends Aware {
  setApplicationContext(applicationContext: ApplicationContext): void;
}

export const ApplicationContextAware = declareInterface(
  'org.springframework.context.ApplicationContextAware',
  { implements: [Aware] },
);
