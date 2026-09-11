import {
  ApplicationListener as ApplicationListenerType,
  ContextClosedEvent,
  getClass,
  Reflectable,
  System,
  type ApplicationListener,
} from '../../../src/index.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
@Reflectable('org.springframework.test.common.event.ContextClosedEventListener', {
  implements: [ApplicationListenerType.of(ContextClosedEvent)],
})
export class ContextClosedEventListener implements ApplicationListener<ContextClosedEvent> {
  onApplicationEvent(_event: ContextClosedEvent): void {
    System.out.println(getClass(this).getName());
  }
}
