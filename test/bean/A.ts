import { Reflectable } from '../../src/index.js';
import type { B } from './B.js';

/**
 * @author derekyi
 * @date 2021/1/25
 */
@Reflectable('org.springframework.test.bean.A')
export class A {
  private b: B | null = null;

  func(): void {}

  getB(): B | null {
    return this.b;
  }

  setB(b: B): void {
    this.b = b;
  }
}
