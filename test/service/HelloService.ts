import {
  ApplicationContextAware as ApplicationContextAwareType,
  BeanFactoryAware as BeanFactoryAwareType,
  Reflectable,
  System,
  type ApplicationContext,
  type ApplicationContextAware,
  type BeanFactory,
  type BeanFactoryAware,
} from '../../src/index.js';

/**
 * @author derekyi
 * @date 2020/11/22
 */
@Reflectable('org.springframework.test.service.HelloService', {
  implements: [ApplicationContextAwareType, BeanFactoryAwareType],
})
export class HelloService implements ApplicationContextAware, BeanFactoryAware {
  private applicationContext: ApplicationContext | null = null;

  private beanFactory: BeanFactory | null = null;

  sayHello(): string {
    System.out.println('hello');
    return 'hello';
  }

  setBeanFactory(beanFactory: BeanFactory): void {
    this.beanFactory = beanFactory;
  }

  setApplicationContext(applicationContext: ApplicationContext): void {
    this.applicationContext = applicationContext;
  }

  getApplicationContext(): ApplicationContext | null {
    return this.applicationContext;
  }

  getBeanFactory(): BeanFactory | null {
    return this.beanFactory;
  }
}
