import { declareInterface } from '../../deps/java/lang/Class.js';
import type { ApplicationEvent } from '../ApplicationEvent.js';
import type { ApplicationListener } from '../ApplicationListener.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
export interface ApplicationEventMulticaster {
  addApplicationListener(listener: ApplicationListener<ApplicationEvent>): void;

  removeApplicationListener(listener: ApplicationListener<ApplicationEvent>): void;

  multicastEvent(event: ApplicationEvent): void;
}

export const ApplicationEventMulticaster = declareInterface(
  'org.springframework.context.event.ApplicationEventMulticaster',
);
