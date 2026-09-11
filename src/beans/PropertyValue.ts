/**
 * bean property information
 *
 * @author derekyi
 * @date 2020/11/23
 */
export class PropertyValue {
  constructor(
    private readonly name: string,
    private readonly value: unknown,
  ) {}

  getName(): string {
    return this.name;
  }

  getValue(): unknown {
    return this.value;
  }
}
