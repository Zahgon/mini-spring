import { Reflectable, System } from '../../src/index.js';

/**
 * @author derekyi
 * @date 2020/11/22
 */
@Reflectable('org.springframework.test.ioc.HelloService')
export class HelloService {
  sayHello(): string {
    System.out.println('hello');
    return 'hello';
  }
}
