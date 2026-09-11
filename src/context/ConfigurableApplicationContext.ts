import { declareInterface } from '../deps/java/lang/Class.js';
import { ApplicationContext } from './ApplicationContext.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
export interface ConfigurableApplicationContext extends ApplicationContext {
  /** Refreshes the container. */
  refresh(): void;

  /** Closes the application context. */
  close(): void;

  /** Registers a hook that closes the container before the VM shuts down. */
  registerShutdownHook(): void;
}

export const ConfigurableApplicationContext = declareInterface(
  'org.springframework.context.ConfigurableApplicationContext',
  { implements: [ApplicationContext] },
);
