/**
 * The test classpath.
 *
 * Maven put `target/test-classes` and `src/test/resources` on the classpath, so
 * every test class was resolvable by name and every fixture by path. TypeScript
 * has no classpath: a class exists only once its module has been evaluated. This
 * file is the explicit equivalent — it is loaded before every test file, and it
 * is what makes `Class.forName("org.springframework.test.bean.Car")` and
 * `classpath:spring.xml` resolve.
 */

import { fileURLToPath } from 'node:url';
import { ClassLoader } from '../../src/index.js';

import '../../src/index.js';
import '../bean/index.js';
import '../common/index.js';
import '../service/index.js';
import '../ioc/HelloService.js';

ClassLoader.addResourceRoot(fileURLToPath(new URL('../resources', import.meta.url)));
