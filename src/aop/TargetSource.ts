import { getClass, Reflectable, type JavaClass } from '../deps/java/lang/Class.js';

/**
 * The target object that is proxied
 *
 * @author derekyi
 * @date 2020/12/6
 */
@Reflectable('org.springframework.aop.TargetSource')
export class TargetSource {
  constructor(private readonly target: object) {}

  /** `getClass().getInterfaces()`: the directly declared interfaces only. */
  getTargetClass(): JavaClass[] {
    return getClass(this.target).getInterfaces();
  }

  getTarget(): object {
    return this.target;
  }
}
