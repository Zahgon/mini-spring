import {
  BeanFactoryPostProcessor as BeanFactoryPostProcessorType,
  PropertyValue,
  Reflectable,
  System,
  type BeanFactoryPostProcessor,
  type ConfigurableListableBeanFactory,
} from '../../src/index.js';

/**
 * @author derekyi
 * @date 2020/11/28
 */
@Reflectable('org.springframework.test.common.CustomBeanFactoryPostProcessor', {
  implements: [BeanFactoryPostProcessorType],
})
export class CustomBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
  postProcessBeanFactory(beanFactory: ConfigurableListableBeanFactory): void {
    System.out.println('CustomBeanFactoryPostProcessor#postProcessBeanFactory');
    const personBeanDefiniton = beanFactory.getBeanDefinition('person');
    const propertyValues = personBeanDefiniton.getPropertyValues();
    // change person's name property to ivy
    propertyValues.addPropertyValue(new PropertyValue('name', 'ivy'));
  }
}
