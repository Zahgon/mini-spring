import { Reflectable, System, Types, stringValueOf } from '../../src/index.js';
import { WorldService } from './WorldService.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
@Reflectable('org.springframework.test.service.WorldServiceImpl', {
  implements: [WorldService],
  fields: { name: Types.String },
  methods: { setName: [Types.String] },
})
export class WorldServiceImpl implements WorldService {
  private name: string | null = null;

  explode(): void {
    System.out.println(`The ${stringValueOf(this.name)} is going to explode`);
  }

  getName(): string | null {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }
}
