import { ApplicationContextEvent, Reflectable, type ApplicationContext } from '../../../src/index.js';

/**
 * @author derekyi
 * @date 2020/12/5
 */
@Reflectable('org.springframework.test.common.event.CustomEvent')
export class CustomEvent extends ApplicationContextEvent {
  constructor(source: ApplicationContext) {
    super(source);
  }
}
