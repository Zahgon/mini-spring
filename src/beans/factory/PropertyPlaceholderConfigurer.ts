import { Reflectable } from '../../deps/java/lang/Class.js';
import { IOException } from '../../deps/java/io/IOExceptions.js';
import { Properties } from '../../deps/java/util/Properties.js';
import { DefaultResourceLoader } from '../../core/io/DefaultResourceLoader.js';
import type { StringValueResolver } from '../../util/StringValueResolver.js';
import { BeansException } from '../BeansException.js';
import { PropertyValue } from '../PropertyValue.js';
import type { ConfigurableListableBeanFactory } from './ConfigurableListableBeanFactory.js';
import type { BeanDefinition } from './config/BeanDefinition.js';
import { BeanFactoryPostProcessor } from './config/BeanFactoryPostProcessor.js';

/**
 * @author derekyi
 * @date 2020/12/13
 */
@Reflectable('org.springframework.beans.factory.PropertyPlaceholderConfigurer', {
  implements: [BeanFactoryPostProcessor],
})
export class PropertyPlaceholderConfigurer implements BeanFactoryPostProcessor {
  static readonly PLACEHOLDER_PREFIX = '${';

  static readonly PLACEHOLDER_SUFFIX = '}';

  private location: string | null = null;

  postProcessBeanFactory(beanFactory: ConfigurableListableBeanFactory): void {
    // load the properties file
    const properties = this.loadProperties();

    // replace the placeholders in the property values
    this.processProperties(beanFactory, properties);

    // register a string resolver on the container, for the @Value annotation
    const valueResolver: StringValueResolver = new PlaceholderResolvingStringValueResolver(
      this,
      properties,
    );
    beanFactory.addEmbeddedValueResolver(valueResolver);
  }

  /**
   * Loads the properties file.
   */
  private loadProperties(): Properties {
    try {
      const resourceLoader = new DefaultResourceLoader();
      const resource = resourceLoader.getResource(this.location!);
      const properties = new Properties();
      properties.load(resource.getInputStream());
      return properties;
    } catch (e) {
      if (e instanceof IOException) {
        throw new BeansException('Could not load properties', e);
      }
      throw e;
    }
  }

  /**
   * Replaces the placeholders in the property values.
   */
  private processProperties(
    beanFactory: ConfigurableListableBeanFactory,
    properties: Properties,
  ): void {
    const beanDefinitionNames = beanFactory.getBeanDefinitionNames();
    for (const beanName of beanDefinitionNames) {
      const beanDefinition = beanFactory.getBeanDefinition(beanName);
      this.resolvePropertyValues(beanDefinition, properties);
    }
  }

  private resolvePropertyValues(beanDefinition: BeanDefinition, properties: Properties): void {
    const propertyValues = beanDefinition.getPropertyValues();
    for (const propertyValue of propertyValues.getPropertyValues()) {
      let value = propertyValue.getValue();
      if (typeof value === 'string') {
        value = this.resolvePlaceholder(value, properties);
        propertyValues.addPropertyValue(new PropertyValue(propertyValue.getName(), value));
      }
    }
  }

  /** TODO only a single placeholder is supported */
  resolvePlaceholder(value: string, properties: Properties): string {
    const strVal = value;
    const startIndex = strVal.indexOf(PropertyPlaceholderConfigurer.PLACEHOLDER_PREFIX);
    const endIndex = strVal.indexOf(PropertyPlaceholderConfigurer.PLACEHOLDER_SUFFIX);
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      const propKey = strVal.substring(startIndex + 2, endIndex);
      const propVal = properties.getProperty(propKey);
      return strVal.slice(0, startIndex) + String(propVal) + strVal.slice(endIndex + 1);
    }
    return strVal;
  }

  setLocation(location: string): void {
    this.location = location;
  }
}

class PlaceholderResolvingStringValueResolver implements StringValueResolver {
  constructor(
    private readonly configurer: PropertyPlaceholderConfigurer,
    private readonly properties: Properties,
  ) {}

  resolveStringValue(strVal: string): string {
    return this.configurer.resolvePlaceholder(strVal, this.properties);
  }
}
