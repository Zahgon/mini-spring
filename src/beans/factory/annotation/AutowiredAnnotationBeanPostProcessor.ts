import { getClass, Reflectable } from '../../../deps/java/lang/Class.js';
import { BeanUtil } from '../../../deps/hutool/BeanUtil.js';
import { TypeUtil } from '../../../deps/hutool/TypeUtil.js';
import type { PropertyValues } from '../../PropertyValues.js';
import type { BeanFactory } from '../BeanFactory.js';
import { BeanFactoryAware } from '../BeanFactoryAware.js';
import type { ConfigurableListableBeanFactory } from '../ConfigurableListableBeanFactory.js';
import { InstantiationAwareBeanPostProcessor } from '../config/InstantiationAwareBeanPostProcessor.js';
import { Autowired } from './Autowired.js';
import { Qualifier } from './Qualifier.js';
import { Value } from './Value.js';

/**
 * The BeanPostProcessor that handles the @Autowired and @Value annotations
 *
 * @author derekyi
 * @date 2020/12/27
 */
@Reflectable(
  'org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor',
  { implements: [InstantiationAwareBeanPostProcessor, BeanFactoryAware] },
)
export class AutowiredAnnotationBeanPostProcessor
  implements InstantiationAwareBeanPostProcessor, BeanFactoryAware
{
  private beanFactory!: ConfigurableListableBeanFactory;

  setBeanFactory(beanFactory: BeanFactory): void {
    this.beanFactory = beanFactory as ConfigurableListableBeanFactory;
  }

  postProcessPropertyValues(pvs: PropertyValues, bean: unknown, _beanName: string): PropertyValues {
    // handle the @Value annotation
    const clazz = getClass(bean as object);
    const fields = clazz.getDeclaredFields();
    for (const field of fields) {
      const valueAnnotation = field.getAnnotation(Value.annotationType);
      if (valueAnnotation !== null) {
        let value: unknown = valueAnnotation.value;
        value = this.beanFactory.resolveEmbeddedValue(value as string);

        // type conversion
        const sourceType = getClass(value as object);
        const targetType = TypeUtil.getType(field);
        const conversionService = this.beanFactory.getConversionService();
        if (conversionService !== null) {
          if (conversionService.canConvert(sourceType, targetType)) {
            value = conversionService.convert(value, targetType);
          }
        }

        BeanUtil.setFieldValue(bean as object, field.getName(), value);
      }
    }

    // handle the @Autowired annotation
    for (const field of fields) {
      const autowiredAnnotation = field.getAnnotation(Autowired.annotationType);
      if (autowiredAnnotation !== null) {
        const fieldType = field.getType();
        const qualifierAnnotation = field.getAnnotation(Qualifier.annotationType);
        let dependentBean: unknown;
        if (qualifierAnnotation !== null) {
          const dependentBeanName = qualifierAnnotation.value;
          dependentBean = this.beanFactory.getBean(dependentBeanName, fieldType);
        } else {
          dependentBean = this.beanFactory.getBean(fieldType);
        }
        BeanUtil.setFieldValue(bean as object, field.getName(), dependentBean);
      }
    }

    return pvs;
  }

  postProcessBeforeInstantiation(): unknown {
    return null;
  }

  postProcessAfterInstantiation(): boolean {
    return true;
  }

  postProcessBeforeInitialization(): unknown {
    return null;
  }

  postProcessAfterInitialization(): unknown {
    return null;
  }
}
