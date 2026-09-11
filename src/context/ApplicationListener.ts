import { declareInterface } from '../deps/java/lang/Class.js';
import type { ApplicationEvent } from './ApplicationEvent.js';

/** `java.util.EventListener` */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventListener {}
export const EventListener = declareInterface('java.util.EventListener');

/**
 * @author derekyi
 * @date 2020/12/2
 */
export interface ApplicationListener<E extends ApplicationEvent> extends EventListener {
  onApplicationEvent(event: E): void;
}

export const ApplicationListener = declareInterface(
  'org.springframework.context.ApplicationListener',
  { implements: [EventListener] },
);
