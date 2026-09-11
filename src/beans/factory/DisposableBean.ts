import { declareInterface } from '../../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/11/29
 */
export interface DisposableBean {
  destroy(): void;
}

export const DisposableBean = declareInterface(
  'org.springframework.beans.factory.DisposableBean',
);
