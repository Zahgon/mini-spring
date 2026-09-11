import { declareInterface } from '../../deps/java/lang/Class.js';

/**
 * @author derekyi
 * @date 2020/11/29
 */
export interface InitializingBean {
  afterPropertiesSet(): void;
}

export const InitializingBean = declareInterface(
  'org.springframework.beans.factory.InitializingBean',
);
