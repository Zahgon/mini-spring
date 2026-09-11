import { Reflectable } from '../../src/index.js';
import type { A } from './A.js';

/**
 * @author derekyi
 * @date 2021/1/25
 */
@Reflectable('org.springframework.test.bean.B')
export class B {
  private a: A | null = null;

  getA(): A | null {
    return this.a;
  }

  setA(a: A): void {
    this.a = a;
  }
}
