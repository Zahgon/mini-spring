import { declareInterface } from '../../deps/java/lang/Class.js';

/**
 * Marker interface: implementing it means the bean can be made aware of the
 * container.
 *
 * @author derekyi
 * @date 2020/12/1
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Aware {}

export const Aware = declareInterface('org.springframework.beans.factory.Aware');
