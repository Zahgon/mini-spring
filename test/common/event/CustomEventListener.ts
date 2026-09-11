import {
  ApplicationListener as ApplicationListenerType,
  getClass,
  Reflectable,
  System,
  type ApplicationListener,
} from '../../../src/index.js';
import { CustomEvent } from './CustomEvent.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
@Reflectable('org.springframework.test.common.event.CustomEventListener', {
  implements: [ApplicationListenerType.of(CustomEvent)],
})
export class CustomEventListener implements ApplicationListener<CustomEvent> {
  onApplicationEvent(_event: CustomEvent): void {
    System.out.println(getClass(this).getName());
  }
}
