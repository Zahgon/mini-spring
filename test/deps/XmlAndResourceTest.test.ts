/**
 * dom4j's element lookup, hutool's string helpers, and the resource loader's
 * branch selection.
 *
 * The one dom4j behaviour the container leans on and a DOM parser does not give
 * for free is local-name matching: `root.element("component-scan")` has to find
 * `<context:component-scan/>`. The resource loader's three branches turn on
 * `java.net.URL`'s protocol handler set, which is why `mailto:` is a URL and
 * `wat://x/y` is a file path.
 */

import { describe, expect, test } from 'vitest';
import {
  BasicType,
  ByteArrayInputStream,
  ClassPathResource,
  DefaultResourceLoader,
  FileNotFoundException,
  FileSystemResource,
  IoUtil,
  SAXReader,
  StrUtil,
  Types,
  UrlResource,
  classOf,
} from '../../src/index.js';
import { Car } from '../bean/Car.js';

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context">
  <context:component-scan base-package="org.x"/>
  <bean id="one" class="C1"><property name="p" value="v"/></bean>
  <bean class="C2"/>
</beans>`;

function parse(): ReturnType<SAXReader['read']> {
  return new SAXReader().read(new ByteArrayInputStream(Buffer.from(XML, 'utf8')));
}

describe('Dom4jTest', () => {
  test('getName returns the local name', () => {
    expect(parse().getRootElement().getName()).toEqual('beans');
  });

  test('element() finds a prefixed element by its local name', () => {
    const scan = parse().getRootElement().element('component-scan');
    expect(scan).not.toBeNull();
    expect(scan!.getName()).toEqual('component-scan');
    expect(scan!.attributeValue('base-package')).toEqual('org.x');
  });

  test('element() returns null when there is no such element', () => {
    expect(parse().getRootElement().element('nope')).toBeNull();
  });

  test('elements() returns the children in document order', () => {
    const beans = parse().getRootElement().elements('bean');
    expect(beans).toHaveLength(2);
    expect(beans[0]!.attributeValue('id')).toEqual('one');
    // an absent attribute is null, not the empty string
    expect(beans[1]!.attributeValue('id')).toBeNull();
    expect(beans[0]!.elements('property')[0]!.attributeValue('name')).toEqual('p');
  });
});

describe('StrUtilTest', () => {
  test('lowerFirst', () => {
    expect(StrUtil.lowerFirst('Car')).toEqual('car');
    expect(StrUtil.lowerFirst('')).toEqual('');
    expect(StrUtil.lowerFirst('ABC')).toEqual('aBC');
    expect(StrUtil.lowerFirst('a')).toEqual('a');
  });

  test('splitToArray keeps whitespace and empty segments', () => {
    expect(StrUtil.splitToArray('a,b', ',')).toEqual(['a', 'b']);
    expect(StrUtil.splitToArray(' a , b ', ',')).toEqual([' a ', ' b ']);
    expect(StrUtil.splitToArray('a', ',')).toEqual(['a']);
    expect(StrUtil.splitToArray('a,,b', ',')).toEqual(['a', '', 'b']);
  });

  test('isEmpty is about length, not whitespace', () => {
    expect(StrUtil.isEmpty(null)).toBe(true);
    expect(StrUtil.isEmpty('')).toBe(true);
    expect(StrUtil.isEmpty(' ')).toBe(false);
    expect(StrUtil.isNotEmpty('x')).toBe(true);
  });

  test('BasicType.wrap boxes primitives and leaves everything else alone', () => {
    expect(BasicType.wrap(Types.int)).toBe(Types.Integer);
    expect(BasicType.wrap(Types.long)).toBe(Types.Long);
    expect(BasicType.wrap(Types.boolean)).toBe(Types.Boolean);
    expect(BasicType.wrap(Types.String)).toBe(Types.String);
    expect(BasicType.wrap(classOf(Car))).toBe(classOf(Car));
  });
});

describe('ResourceLoaderTest', () => {
  const resourceLoader = new DefaultResourceLoader();

  test('classpath: resources', () => {
    const resource = resourceLoader.getResource('classpath:hello.txt');
    expect(resource instanceof ClassPathResource).toBe(true);
    expect(IoUtil.readUtf8(resource.getInputStream())).toEqual('hello world');
  });

  test('a missing classpath resource reports the JDK message', () => {
    expect(() => resourceLoader.getResource('classpath:nope.txt').getInputStream()).toThrowError(
      new FileNotFoundException('nope.txt cannot be opened because it does not exist'),
    );
  });

  test('a plain path is a file-system resource', () => {
    const resource = resourceLoader.getResource('no/such/file.txt');
    expect(resource instanceof FileSystemResource).toBe(true);
    expect(() => resource.getInputStream()).toThrowError(
      new FileNotFoundException('no/such/file.txt'),
    );
  });

  test('the branch depends on the JDK protocol handler set', () => {
    expect(resourceLoader.getResource('https://example.com/x') instanceof UrlResource).toBe(true);
    // mailto: has a handler, so it is a URL ...
    expect(resourceLoader.getResource('mailto:a@b.c') instanceof UrlResource).toBe(true);
    // ... and an unknown scheme is not, so it falls through to the file system
    expect(resourceLoader.getResource('wat://x/y') instanceof FileSystemResource).toBe(true);
  });
});
