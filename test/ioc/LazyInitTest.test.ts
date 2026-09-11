import { expect, test } from 'vitest';
import { ClassPathXmlApplicationContext, System, TimeUnit } from '../../src/index.js';
import { recordOutput } from '../support/output.js';
import type { Car } from '../bean/Car.js';

test('testLazyInit', () => {
  let refreshed = 0;
  const lines = recordOutput(() => {
    const applicationContext = new ClassPathXmlApplicationContext('classpath:lazy-test.xml');
    refreshed = System.currentTimeMillis();
    System.out.println(`${String(System.currentTimeMillis())}:applicationContext-over`);
    TimeUnit.SECONDS.sleep(1);
    const c = applicationContext.getBean('car') as Car;
    c.showTime(); // shows when the bean was created
  });

  expect(lines).toHaveLength(2);
  expect(lines[0]).toMatch(/^\d+:applicationContext-over$/);
  expect(lines[1]).toMatch(/^\d+:bean create$/);
  // the lazy bean's init-method stamped its creation time after the sleep, so
  // refresh() did not instantiate it
  const created = Number.parseInt(lines[1]!.split(':')[0]!, 10);
  expect(created - refreshed).toBeGreaterThanOrEqual(1000);
});
