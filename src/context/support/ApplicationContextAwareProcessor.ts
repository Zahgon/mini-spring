import { Reflectable } from '../../deps/java/lang/Class.js';
import { BeanPostProcessor } from '../../beans/factory/config/BeanPostProcessor.js';
import type { ApplicationContext } from '../ApplicationContext.js';
import { ApplicationContextAware } from '../ApplicationContextAware.js';

/**
 * @author derekyi
 * @date 2020/12/1
 */
@Reflectable('org.springframework.context.support.ApplicationContextAwareProcessor', {
  implements: [BeanPostProcessor],
})
export class ApplicationContextAwareProcessor implements BeanPostProcessor {
  constructor(private readonly applicationContext: ApplicationContext) {}

  postProcessBeforeInitialization(bean: unknown, _beanName: string): unknown {
    if (ApplicationContextAware.isInstance(bean)) {
      (bean as ApplicationContextAware).setApplicationContext(this.applicationContext);
    }
    return bean;
  }

  postProcessAfterInitialization(bean: unknown, _beanName: string): unknown {
    return bean;
  }
}
