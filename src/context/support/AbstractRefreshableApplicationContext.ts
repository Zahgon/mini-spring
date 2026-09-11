import { Reflectable } from '../../deps/java/lang/Class.js';
import { DefaultListableBeanFactory } from '../../beans/factory/support/DefaultListableBeanFactory.js';
import { AbstractApplicationContext } from './AbstractApplicationContext.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
@Reflectable('org.springframework.context.support.AbstractRefreshableApplicationContext')
export abstract class AbstractRefreshableApplicationContext extends AbstractApplicationContext {
  private beanFactory!: DefaultListableBeanFactory;

  /**
   * Creates the beanFactory and loads the BeanDefinition instances.
   */
  protected override refreshBeanFactory(): void {
    const beanFactory = this.createBeanFactory();
    this.loadBeanDefinitions(beanFactory);
    this.beanFactory = beanFactory;
  }

  /**
   * Creates the bean factory.
   */
  protected createBeanFactory(): DefaultListableBeanFactory {
    return new DefaultListableBeanFactory();
  }

  /**
   * Loads the BeanDefinition instances.
   */
  protected abstract loadBeanDefinitions(beanFactory: DefaultListableBeanFactory): void;

  override getBeanFactory(): DefaultListableBeanFactory {
    return this.beanFactory;
  }
}
