import { declareInterface } from '../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/12/27
 */
export interface StringValueResolver {
  resolveStringValue(strVal: string): string;
}

export const StringValueResolver = declareInterface('org.springframework.util.StringValueResolver');
