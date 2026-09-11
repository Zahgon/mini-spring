import { forName, Reflectable, type JavaClass } from '../../../deps/java/lang/Class.js';
import { Boolean_ } from '../../../deps/java/lang/Boxed.js';
import { ClassNotFoundException } from '../../../deps/java/lang/Exceptions.js';
import { IOException } from '../../../deps/java/io/IOExceptions.js';
import { DocumentException, SAXReader } from '../../../deps/dom4j/index.js';
import { StrUtil } from '../../../deps/hutool/StrUtil.js';
import { ClassPathBeanDefinitionScanner } from '../../../context/annotation/ClassPathBeanDefinitionScanner.js';
import type { Resource } from '../../../core/io/Resource.js';
import type { ResourceLoader } from '../../../core/io/ResourceLoader.js';
import { BeansException } from '../../BeansException.js';
import { PropertyValue } from '../../PropertyValue.js';
import { BeanDefinition } from '../config/BeanDefinition.js';
import { BeanReference } from '../config/BeanReference.js';
import { AbstractBeanDefinitionReader } from '../support/AbstractBeanDefinitionReader.js';
import type { BeanDefinitionRegistry } from '../support/BeanDefinitionRegistry.js';
import type { InputStream } from '../../../deps/java/io/InputStream.js';

/**
 * Reads the bean definitions configured in an XML file
 *
 * @author derekyi
 * @date 2020/11/26
 */
@Reflectable('org.springframework.beans.factory.xml.XmlBeanDefinitionReader')
export class XmlBeanDefinitionReader extends AbstractBeanDefinitionReader {
  static readonly BEAN_ELEMENT = 'bean';
  static readonly PROPERTY_ELEMENT = 'property';
  static readonly ID_ATTRIBUTE = 'id';
  static readonly NAME_ATTRIBUTE = 'name';
  static readonly CLASS_ATTRIBUTE = 'class';
  static readonly VALUE_ATTRIBUTE = 'value';
  static readonly REF_ATTRIBUTE = 'ref';
  static readonly INIT_METHOD_ATTRIBUTE = 'init-method';
  static readonly DESTROY_METHOD_ATTRIBUTE = 'destroy-method';
  static readonly SCOPE_ATTRIBUTE = 'scope';
  static readonly LAZYINIT_ATTRIBUTE = 'lazyInit';
  static readonly BASE_PACKAGE_ATTRIBUTE = 'base-package';
  static readonly COMPONENT_SCAN_ELEMENT = 'component-scan';

  constructor(registry: BeanDefinitionRegistry, resourceLoader?: ResourceLoader) {
    super(registry, resourceLoader);
  }

  protected override loadBeanDefinitionsFromLocation(location: string): void {
    const resourceLoader = this.getResourceLoader();
    const resource = resourceLoader.getResource(location);
    this.loadBeanDefinitions(resource);
  }

  protected override loadBeanDefinitionsFromResource(resource: Resource): void {
    try {
      const inputStream = resource.getInputStream();
      try {
        this.doLoadBeanDefinitions(inputStream);
      } finally {
        inputStream.close();
      }
    } catch (ex) {
      if (ex instanceof IOException || ex instanceof DocumentException) {
        throw new BeansException(`IOException parsing XML document from ${String(resource)}`, ex);
      }
      throw ex;
    }
  }

  protected doLoadBeanDefinitions(inputStream: InputStream): void {
    const reader = new SAXReader();
    const document = reader.read(inputStream);

    const root = document.getRootElement();

    // parse the context:component-scan element, scan the named packages for
    // classes, and turn what they declare into BeanDefinition instances
    const componentScan = root.element(XmlBeanDefinitionReader.COMPONENT_SCAN_ELEMENT);
    if (componentScan !== null) {
      const scanPath = componentScan.attributeValue(XmlBeanDefinitionReader.BASE_PACKAGE_ATTRIBUTE);
      if (StrUtil.isEmpty(scanPath)) {
        throw new BeansException('The value of base-package attribute can not be empty or null');
      }
      this.scanPackage(scanPath!);
    }

    const beanList = root.elements(XmlBeanDefinitionReader.BEAN_ELEMENT);
    for (const bean of beanList) {
      const beanId = bean.attributeValue(XmlBeanDefinitionReader.ID_ATTRIBUTE);
      let beanName = bean.attributeValue(XmlBeanDefinitionReader.NAME_ATTRIBUTE);
      const className = bean.attributeValue(XmlBeanDefinitionReader.CLASS_ATTRIBUTE);
      const initMethodName = bean.attributeValue(XmlBeanDefinitionReader.INIT_METHOD_ATTRIBUTE);
      const destroyMethodName = bean.attributeValue(
        XmlBeanDefinitionReader.DESTROY_METHOD_ATTRIBUTE,
      );
      const beanScope = bean.attributeValue(XmlBeanDefinitionReader.SCOPE_ATTRIBUTE);
      const lazyInit = bean.attributeValue(XmlBeanDefinitionReader.LAZYINIT_ATTRIBUTE);
      let clazz: JavaClass;
      try {
        clazz = forName(className!);
      } catch (e) {
        if (!(e instanceof ClassNotFoundException)) {
          throw e;
        }
        throw new BeansException(`Cannot find class [${String(className)}]`);
      }
      // id takes precedence over name
      beanName = StrUtil.isNotEmpty(beanId) ? beanId : beanName;
      if (StrUtil.isEmpty(beanName)) {
        // when both id and name are empty, decapitalise the class's simple name
        beanName = StrUtil.lowerFirst(clazz.getSimpleName());
      }

      const beanDefinition = new BeanDefinition(clazz);
      beanDefinition.setInitMethodName(initMethodName);
      beanDefinition.setDestroyMethodName(destroyMethodName);
      beanDefinition.setLazyInit(Boolean_.parseBoolean(lazyInit));
      if (StrUtil.isNotEmpty(beanScope)) {
        beanDefinition.setScope(beanScope);
      }

      const propertyList = bean.elements(XmlBeanDefinitionReader.PROPERTY_ELEMENT);
      for (const property of propertyList) {
        const propertyNameAttribute = property.attributeValue(
          XmlBeanDefinitionReader.NAME_ATTRIBUTE,
        );
        const propertyValueAttribute = property.attributeValue(
          XmlBeanDefinitionReader.VALUE_ATTRIBUTE,
        );
        const propertyRefAttribute = property.attributeValue(XmlBeanDefinitionReader.REF_ATTRIBUTE);

        if (StrUtil.isEmpty(propertyNameAttribute)) {
          throw new BeansException('The name attribute cannot be null or empty');
        }

        let value: unknown = propertyValueAttribute;
        if (StrUtil.isNotEmpty(propertyRefAttribute)) {
          value = new BeanReference(propertyRefAttribute);
        }
        const propertyValue = new PropertyValue(propertyNameAttribute!, value);
        beanDefinition.getPropertyValues().addPropertyValue(propertyValue);
      }
      if (this.getRegistry().containsBeanDefinition(beanName!)) {
        // bean names must be unique
        throw new BeansException(`Duplicate beanName[${String(beanName)}] is not allowed`);
      }
      // register the BeanDefinition
      this.getRegistry().registerBeanDefinition(beanName!, beanDefinition);
    }
  }

  /**
   * Scans for classes annotated with Component and turns what they declare
   * into BeanDefinition instances.
   */
  private scanPackage(scanPath: string): void {
    const basePackages = StrUtil.splitToArray(scanPath, ',');
    const scanner = new ClassPathBeanDefinitionScanner(this.getRegistry());
    scanner.doScan(...basePackages);
  }
}
