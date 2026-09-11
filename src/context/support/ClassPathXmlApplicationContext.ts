import { Reflectable } from '../../deps/java/lang/Class.js';
import { AbstractXmlApplicationContext } from './AbstractXmlApplicationContext.js';

/**
 * The application context backed by an XML file
 *
 * @author derekyi
 * @date 2020/11/28
 */
@Reflectable('org.springframework.context.support.ClassPathXmlApplicationContext')
export class ClassPathXmlApplicationContext extends AbstractXmlApplicationContext {
  private readonly configLocations: string[];

  /**
   * Loads the BeanDefinition instances from XML files and refreshes the
   * context automatically.
   *
   * @param configLocations the XML configuration file(s)
   * @throws BeansException when the application context cannot be created
   */
  constructor(configLocations: string | string[]) {
    super();
    this.configLocations = typeof configLocations === 'string' ? [configLocations] : configLocations;
    this.refresh();
  }

  protected override getConfigLocations(): string[] {
    return this.configLocations;
  }
}
