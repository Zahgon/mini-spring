import { Reflectable } from '../../deps/java/lang/Class.js';
import type { DefaultListableBeanFactory } from '../../beans/factory/support/DefaultListableBeanFactory.js';
import { XmlBeanDefinitionReader } from '../../beans/factory/xml/XmlBeanDefinitionReader.js';
import { AbstractRefreshableApplicationContext } from './AbstractRefreshableApplicationContext.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
@Reflectable('org.springframework.context.support.AbstractXmlApplicationContext')
export abstract class AbstractXmlApplicationContext extends AbstractRefreshableApplicationContext {
  protected override loadBeanDefinitions(beanFactory: DefaultListableBeanFactory): void {
    const beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory, this);
    const configLocations = this.getConfigLocations();
    if (configLocations !== null) {
      beanDefinitionReader.loadBeanDefinitions(configLocations);
    }
  }

  protected abstract getConfigLocations(): string[] | null;
}
