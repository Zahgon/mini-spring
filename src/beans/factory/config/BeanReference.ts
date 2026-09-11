/**
 * A reference from one bean to another
 *
 * @author derekyi
 * @date 2020/11/24
 */
export class BeanReference {
  constructor(private readonly beanName: string) {}

  getBeanName(): string {
    return this.beanName;
  }
}
