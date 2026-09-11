/**
 * @author derekyi
 * @date 2020/11/25
 */
import { expect, test } from 'vitest';
import {
  DefaultResourceLoader,
  FileSystemResource,
  IoUtil,
  System,
  UrlResource,
  type Resource,
} from '../../src/index.js';

test('testResourceLoader', () => {
  const resourceLoader = new DefaultResourceLoader();

  // load a resource from the classpath
  let resource: Resource = resourceLoader.getResource('classpath:hello.txt');
  let inputStream = resource.getInputStream();
  let content = IoUtil.readUtf8(inputStream);
  System.out.println(content);
  expect(content).toEqual('hello world');

  // load a resource from the file system
  resource = resourceLoader.getResource('test/resources/hello.txt');
  expect(resource instanceof FileSystemResource).toBe(true);
  inputStream = resource.getInputStream();
  content = IoUtil.readUtf8(inputStream);
  System.out.println(content);
  expect(content).toEqual('hello world');

  // load a resource from a URL
  resource = resourceLoader.getResource(
    'https://github.com/DerekYRC/mini-spring/blob/main/README.md',
  );
  expect(resource instanceof UrlResource).toBe(true);
  inputStream = resource.getInputStream();
  content = IoUtil.readUtf8(inputStream);
  System.out.println(content);
});
