import { FactoryBean as FactoryBeanType, Reflectable, type FactoryBean } from '../../src/index.js';
import { StringToLocalDateConverter } from './StringToLocalDateConverter.js';

/**
 * @author derekyi
 * @date 2021/1/17
 */
@Reflectable('org.springframework.test.common.ConvertersFactoryBean', {
  implements: [FactoryBeanType],
})
export class ConvertersFactoryBean implements FactoryBean<Set<unknown>> {
  getObject(): Set<unknown> {
    const converters = new Set<unknown>();
    const stringToLocalDateConverter = new StringToLocalDateConverter('yyyy-MM-dd');
    converters.add(stringToLocalDateConverter);
    return converters;
  }

  isSingleton(): boolean {
    return true;
  }
}
