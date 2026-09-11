import {
  asClass,
  declareInterface,
  type JavaClass,
  type TypeRef,
} from '../../../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2021/1/16
 */
export interface GenericConverter {
  getConvertibleTypes(): Iterable<ConvertiblePair>;

  convert(source: unknown, sourceType: JavaClass, targetType: JavaClass): unknown;
}

export const GenericConverter = declareInterface(
  'org.springframework.core.convert.converter.GenericConverter',
);

/** `GenericConverter.ConvertiblePair` */
export class ConvertiblePair {
  private readonly sourceType: JavaClass;
  private readonly targetType: JavaClass;

  constructor(sourceType: TypeRef, targetType: TypeRef) {
    this.sourceType = asClass(sourceType);
    this.targetType = asClass(targetType);
  }

  getSourceType(): JavaClass {
    return this.sourceType;
  }

  getTargetType(): JavaClass {
    return this.targetType;
  }

  equals(obj: unknown): boolean {
    if (this === obj) {
      return true;
    }
    if (!(obj instanceof ConvertiblePair)) {
      return false;
    }
    return this.sourceType === obj.sourceType && this.targetType === obj.targetType;
  }

  hashCode(): number {
    return (Math.imul(this.sourceType.hashCode(), 31) + this.targetType.hashCode()) | 0;
  }
}
