import type {
  Attack,
  AttackEffect,
  CoinConditionalDamage,
  CoinConditionalEffect,
  CoinConstraintQueues,
  CoinFlipResolution,
  CoinHistory,
  CoinSide,
} from '@/features/game/types';

function oppositeCoinSide(side: CoinSide): CoinSide {
  return side === 'face' ? 'pile' : 'face';
}

function invertCoinResult(result: CoinSide[]): CoinSide[] {
  return result.map(oppositeCoinSide);
}

function areCoinResultsEqual(first: CoinSide[], second: CoinSide[]): boolean {
  return (
    first.length === second.length && first.every((side, index) => side === second[index])
  );
}

export function resolveCoinFlip(
  history: CoinHistory,
  coinCount: number,
  constraints: CoinConstraintQueues
): CoinFlipResolution {
  const historyResult = getNextCoinResultFromHistory(history, coinCount);
  const trainerConstraint = getPendingCoinConstraint(constraints, coinCount);

  if (!historyResult) {
    if (trainerConstraint) {
      return {
        result: trainerConstraint,
        choiceAllowed: false,
        consumeTrainerConstraint: true,
        reason: 'trainer',
      };
    }

    return {
      result: null,
      choiceAllowed: true,
      consumeTrainerConstraint: false,
      reason: 'free',
    };
  }

  if (!trainerConstraint) {
    return {
      result: historyResult,
      choiceAllowed: false,
      consumeTrainerConstraint: false,
      reason: 'history',
    };
  }

  if (areCoinResultsEqual(historyResult, trainerConstraint)) {
    return {
      result: historyResult,
      choiceAllowed: false,
      consumeTrainerConstraint: false,
      reason: 'history',
    };
  }

  return {
    result: trainerConstraint,
    choiceAllowed: false,
    consumeTrainerConstraint: true,
    reason: 'trainer',
  };
}

export function saveCoinResult(
  history: CoinHistory,
  coinCount: number,
  result: CoinSide[]
): CoinHistory {
  return {
    ...history,
    [coinCount]: [...result],
  };
}

export function consumeCoinConstraint(
  constraints: CoinConstraintQueues,
  coinCount: number
): CoinConstraintQueues {
  const queue = constraints[coinCount] ?? [];

  if (queue.length === 0) {
    return constraints;
  }

  const remainingQueue = queue.slice(1);
  const newConstraints = { ...constraints };

  if (remainingQueue.length === 0) {
    delete newConstraints[coinCount];
  } else {
    newConstraints[coinCount] = remainingQueue;
  }

  return newConstraints;
}

export function addTrainerCoinConstraint(
  constraints: CoinConstraintQueues,
  coinCount: number,
  trainerResult: CoinSide[]
): CoinConstraintQueues {
  const currentQueue = constraints[coinCount] ?? [];
  const nextRequiredResult = invertCoinResult(trainerResult);

  return {
    ...constraints,
    [coinCount]: [...currentQueue, nextRequiredResult],
  };
}

function getNextCoinResultFromHistory(
  history: CoinHistory,
  coinCount: number
): CoinSide[] | null {
  const lastResult = history[coinCount];
  return lastResult ? invertCoinResult(lastResult) : null;
}

function getPendingCoinConstraint(
  constraints: CoinConstraintQueues,
  coinCount: number
): CoinSide[] | null {
  return constraints[coinCount]?.[0] ?? null;
}

export function getCoinTriggeredEffects(
  attack: Attack,
  coinResult?: CoinSide[]
): AttackEffect[] {
  if (!coinResult || !attack.coinEffects) {
    return [];
  }

  return attack.coinEffects
    .filter((coinEffect) => doesCoinConditionMatch(coinEffect, coinResult))
    .map((coinEffect) => coinEffect.effect);
}

export function calculateCoinDamage(attack: Attack, coinResult?: CoinSide[]): number {
  if (!coinResult) {
    return attack.damage;
  }

  const faceDamage = countCoinSide(coinResult, 'face') * (attack.damagePerFace ?? 0);
  const pileDamage = countCoinSide(coinResult, 'pile') * (attack.damagePerPile ?? 0);
  const conditionalDamage =
    attack.coinDamageEffects?.reduce(
      (total, coinDamage) =>
        doesCoinDamageConditionMatch(coinDamage, coinResult)
          ? total + coinDamage.damage
          : total,
      0
    ) ?? 0;

  return attack.damage + faceDamage + pileDamage + conditionalDamage;
}

export function doesAttackFailFromCoin(attack: Attack, coinResult?: CoinSide[]): boolean {
  return !!(coinResult && attack.failsOn && coinResult.includes(attack.failsOn));
}

function doesCoinDamageConditionMatch(
  coinDamage: CoinConditionalDamage,
  coinResult: CoinSide[]
): boolean {
  const matchingCount = countCoinSide(coinResult, coinDamage.side);

  if (!coinDamage.condition || coinDamage.condition === 'any') {
    return matchingCount > 0;
  }

  if (coinDamage.condition === 'all') {
    return matchingCount === coinResult.length;
  }

  if (coinDamage.condition === 'exact') {
    return matchingCount === (coinDamage.count ?? 0);
  }

  return false;
}

function doesCoinConditionMatch(
  coinEffect: CoinConditionalEffect,
  coinResult: CoinSide[]
): boolean {
  const matchingCount = countCoinSide(coinResult, coinEffect.side);

  if (!coinEffect.condition || coinEffect.condition === 'any') {
    return matchingCount > 0;
  }

  if (coinEffect.condition === 'all') {
    return matchingCount === coinResult.length;
  }

  if (coinEffect.condition === 'exact') {
    return matchingCount === (coinEffect.count ?? 0);
  }

  return false;
}

export function countCoinSide(result: CoinSide[] | undefined, side: CoinSide): number {
  if (!result) {
    return 0;
  }

  return result.filter((coin) => coin === side).length;
}

export function hasCoinSide(result: CoinSide[] | undefined, side: CoinSide): boolean {
  return countCoinSide(result, side) > 0;
}

export function isAllCoinSide(
  result: (CoinSide | null)[] | undefined,
  side: CoinSide
): boolean {
  return !!result && result.length > 0 && result.every((coin) => coin === side);
}
