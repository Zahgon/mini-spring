import {
  ApplicationListener as ApplicationListenerType,
  ContextRefreshedEvent,
  getClass,
  Reflectable,
  System,
  type ApplicationListener,
} from '../../../src/index.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
@Reflectable('org.springframework.test.common.event.ContextRefreshedEventListener', {
  implements: [ApplicationListenerType.of(ContextRefreshedEvent)],
})
export class ContextRefreshedEventListener implements ApplicationListener<ContextRefreshedEvent> {
  onApplicationEvent(_event: ContextRefreshedEvent): void {
    System.out.println(getClass(this).getName());
  }
}
