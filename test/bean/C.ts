import { Reflectable, System } from '../../src/index.js';

@Reflectable('org.springframework.test.bean.C')
export class C {
  sayHello(): void {
    System.out.println("I'm C ");
  }
}
