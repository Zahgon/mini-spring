import { Reflectable } from '../deps/java/lang/Class.js';
import { EventObject } from '../deps/java/util/EventObject.js';

/**
 * @author derekyi
 * @date 2020/12/2
 */
@Reflectable('org.springframework.context.ApplicationEvent')
export abstract class ApplicationEvent extends EventObject {}
