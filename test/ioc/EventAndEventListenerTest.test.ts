/**
 * @author derekyi
 * @date 2020/12/5
 */
import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext } from '../../src/index.js';
import { recordOutput } from '../support/output.js';
import { CustomEvent } from '../common/event/CustomEvent.js';

test('testEventListener', () => {
  let applicationContext!: ClassPathXmlApplicationContext;
  // refresh() publishes ContextRefreshedEvent, and only the listener declared
  // for that event type responds
  expect(
    recordOutput(() => {
      applicationContext = new ClassPathXmlApplicationContext(
        'classpath:event-and-event-listener.xml',
      );
    }),
  ).toEqual(['org.springframework.test.common.event.ContextRefreshedEventListener']);

  expect(
    recordOutput(() => applicationContext.publishEvent(new CustomEvent(applicationContext))),
  ).toEqual(['org.springframework.test.common.event.CustomEventListener']);

  applicationContext.registerShutdownHook(); // or applicationContext.close() to close the container explicitly
});
