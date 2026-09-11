import type { PropertyValue } from './PropertyValue.js';

/**
 * @author derekyi
 * @date 2020/11/23
 */
export class PropertyValues {
  private readonly propertyValueList: PropertyValue[] = [];

  addPropertyValue(pv: PropertyValue): void {
    for (let i = 0; i < this.propertyValueList.length; i++) {
      const currentPv = this.propertyValueList[i]!;
      if (currentPv.getName() === pv.getName()) {
        // overwrite the existing property value, in place
        this.propertyValueList[i] = pv;
        return;
      }
    }
    this.propertyValueList.push(pv);
  }

  getPropertyValues(): PropertyValue[] {
    return [...this.propertyValueList];
  }

  getPropertyValue(propertyName: string): PropertyValue | null {
    for (const pv of this.propertyValueList) {
      if (pv.getName() === propertyName) {
        return pv;
      }
    }
    return null;
  }
}
