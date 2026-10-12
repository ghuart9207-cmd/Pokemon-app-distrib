import type { AttackEffect } from './cards';

export type CoinSide = 'face' | 'pile';

export type CoinHistory = Partial<Record<number, CoinSide[]>>;

export type CoinConstraintQueues = Partial<Record<number, CoinSide[][]>>;

export type CoinFlipResolution = {
  result: CoinSide[] | null;
  choiceAllowed: boolean;
  consumeTrainerConstraint: boolean;
  reason: 'free' | 'history' | 'trainer';
};

export type CoinAttackReference = {
  cellName: string;
  attackIndex: number;
  coinResult?: CoinSide[];
};

export type CoinCondition = 'any' | 'all' | 'exact';

export type CoinConditionalEffect = {
  side: CoinSide;

  condition?: CoinCondition;

  count?: number;

  effect: AttackEffect;
};

export type CoinConditionalDamage = {
  side: CoinSide;

  condition?: CoinCondition;

  count?: number;

  damage: number;
};
