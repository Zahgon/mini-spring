import { Reflectable } from '../../deps/java/lang/Class.js';
import { ApplicationContextEvent } from './ApplicationContextEvent.js';

/**
 * @author derekyi
 * @date 2020/12/2
 */
@Reflectable('org.springframework.context.event.ContextClosedEvent')
export class ContextClosedEvent extends ApplicationContextEvent {}
