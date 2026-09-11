/**
 * @author derekyi
 * @date 2020/12/27
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { Person } from '../bean/Person.js';

test('testAutowiredAnnotation', () => {
  const applicationContext = new ClassPathXmlApplicationContext(
    'classpath:autowired-annotation.xml',
  );

  const person = applicationContext.getBean<Person>(Person);
  expect(person.getCar()).not.toBeNull();
});
