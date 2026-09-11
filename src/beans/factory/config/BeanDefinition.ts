import type { JavaClass } from '../../../deps/java/lang/Class.js';
import { stringHashCode } from '../../../deps/java/lang/Class.js';
import { PropertyValues } from '../../PropertyValues.js';

/**
 * A BeanDefinition holds a bean's information: its class, constructor
 * arguments, properties and scope. This simplified version holds only the
 * class and the properties.
 *
 * @author derekyi
 * @date 2020/11/22
 */
export class BeanDefinition {
  static SCOPE_SINGLETON = 'singleton';

  static SCOPE_PROTOTYPE = 'prototype';

  /** the bean class */
  private beanClass: JavaClass;

  /** the property values of the class */
  private propertyValues: PropertyValues;

  /** the name of the initialisation method, invoked reflectively */
  private initMethodName: string | null = null;

  /** the name of the destruction method */
  private destroyMethodName: string | null = null;

  /** the scope; a singleton bean by default */
  private scope: string = BeanDefinition.SCOPE_SINGLETON;

  private singleton = true;

  private prototype = false;

  /** lazy initialisation */
  private lazyInit = false;

  constructor(beanClass: JavaClass, propertyValues: PropertyValues | null = null) {
    this.beanClass = beanClass;
    this.propertyValues = propertyValues !== null ? propertyValues : new PropertyValues();
  }

  setScope(scope: string): void {
    this.scope = scope;
    this.singleton = BeanDefinition.SCOPE_SINGLETON === scope;
    this.prototype = BeanDefinition.SCOPE_PROTOTYPE === scope;
  }

  getScope(): string {
    return this.scope;
  }

  isSingleton(): boolean {
    return this.singleton;
  }

  isPrototype(): boolean {
    return this.prototype;
  }

  getBeanClass(): JavaClass {
    return this.beanClass;
  }

  setBeanClass(beanClass: JavaClass): void {
    this.beanClass = beanClass;
  }

  getPropertyValues(): PropertyValues {
    return this.propertyValues;
  }

  setPropertyValues(propertyValues: PropertyValues): void {
    this.propertyValues = propertyValues;
  }

  getInitMethodName(): string | null {
    return this.initMethodName;
  }

  setInitMethodName(initMethodName: string | null): void {
    this.initMethodName = initMethodName;
  }

  getDestroyMethodName(): string | null {
    return this.destroyMethodName;
  }

  setDestroyMethodName(destroyMethodName: string | null): void {
    this.destroyMethodName = destroyMethodName;
  }

  equals(o: unknown): boolean {
    if (this === o) {
      return true;
    }
    if (!(o instanceof BeanDefinition)) {
      return false;
    }
    return this.beanClass === o.beanClass;
  }

  hashCode(): number {
    return (31 + stringHashCode(this.beanClass.getName())) | 0;
  }

  setLazyInit(b: boolean): void {
    this.lazyInit = b;
  }

  isLazyInit(): boolean {
    return this.lazyInit;
  }
}
