/**
 * Components for the contract tests.
 *
 * They live in their own package so that scanning them cannot disturb
 * `org.springframework.test.bean`, which the ported fixtures scan.
 */

import {
  Autowired,
  Component,
  Qualifier,
  Reflectable,
  Scope,
  declareInterface,
} from '../../src/index.js';

export interface Engine {
  name(): string;
}

export const Engine = declareInterface('org.springframework.test.contract.Engine', {
  methods: { name: [] },
});

@Component('engineA')
@Reflectable('org.springframework.test.contract.EngineA', { implements: [Engine] })
export class EngineA implements Engine {
  name(): string {
    return 'A';
  }
}

@Component('engineB')
@Reflectable('org.springframework.test.contract.EngineB', { implements: [Engine] })
export class EngineB implements Engine {
  name(): string {
    return 'B';
  }
}

@Component()
@Scope('prototype')
@Reflectable('org.springframework.test.contract.Widget', { fields: { engine: Engine } })
export class Widget {
  @Autowired()
  @Qualifier('engineB')
  private engine: Engine | null = null;

  getEngine(): Engine | null {
    return this.engine;
  }
}
