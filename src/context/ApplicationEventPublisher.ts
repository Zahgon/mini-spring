import { declareInterface } from '../deps/java/lang/Class.js';
import type { ApplicationEvent } from './ApplicationEvent.js';

/**
 * The event publisher interface
 *
 * @author derekyi
 * @date 2020/12/5
 */
export interface ApplicationEventPublisher {
  /** Publishes an event. */
  publishEvent(event: ApplicationEvent): void;
}

export const ApplicationEventPublisher = declareInterface(
  'org.springframework.context.ApplicationEventPublisher',
);
