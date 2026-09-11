import { declareInterface } from '../../src/index.js';

/**
 * @author derekyi
 * @date 2020/12/6
 */
export interface WorldService {
  explode(): void;

  getName(): string | null;
}

export const WorldService = declareInterface('org.springframework.test.service.WorldService', {
  methods: { explode: [], getName: [] },
});
