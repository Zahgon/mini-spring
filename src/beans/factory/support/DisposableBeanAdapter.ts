import { getClass, Reflectable } from '../../../deps/java/lang/Class.js';
import { ClassUtil } from '../../../deps/hutool/ClassUtil.js';
import { StrUtil } from '../../../deps/hutool/StrUtil.js';
import { BeansException } from '../../BeansException.js';
import { DisposableBean } from '../DisposableBean.js';
import type { BeanDefinition } from '../config/BeanDefinition.js';

/**
 * @author derekyi
 * @date 2020/11/29
 */
@Reflectable('org.springframework.beans.factory.support.DisposableBeanAdapter', {
  implements: [DisposableBean],
})
export class DisposableBeanAdapter implements DisposableBean {
  private readonly destroyMethodName: string | null;

  constructor(
    private readonly bean: object,
    private readonly beanName: string,
    beanDefinition: BeanDefinition,
  ) {
    this.destroyMethodName = beanDefinition.getDestroyMethodName();
  }

  destroy(): void {
    if (DisposableBean.isInstance(this.bean)) {
      (this.bean as DisposableBean).destroy();
    }

    // guard against running the destruction method twice when the bean is a
    // DisposableBean and its custom method has the same name
    if (
      StrUtil.isNotEmpty(this.destroyMethodName) &&
      !(DisposableBean.isInstance(this.bean) && this.destroyMethodName === 'destroy')
    ) {
      // run the custom method
      const destroyMethod = ClassUtil.getPublicMethod(getClass(this.bean), this.destroyMethodName);
      if (destroyMethod === null) {
        throw new BeansException(
          `Couldn't find a destroy method named '${this.destroyMethodName}' on bean with name '${this.beanName}'`,
        );
      }
      destroyMethod.invoke(this.bean);
    }
  }
}
