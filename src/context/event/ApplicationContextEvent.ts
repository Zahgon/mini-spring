import { Reflectable } from '../../deps/java/lang/Class.js';
import { ApplicationEvent } from '../ApplicationEvent.js';
import type { ApplicationContext } from '../ApplicationContext.js';

/**
 * @author derekyi
 * @date 2020/12/2
 */
@Reflectable('org.springframework.context.event.ApplicationContextEvent')
export abstract class ApplicationContextEvent extends ApplicationEvent {
  constructor(source: ApplicationContext) {
    super(source as unknown as object);
  }

  getApplicationContext(): ApplicationContext {
    return this.getSource() as unknown as ApplicationContext;
  }
}
