import type {
  Attack,
  AttackEffect,
  CoinConditionalDamage,
  CoinConditionalEffect,
  CoinConstraintQueues,
  CoinFlipResolution,
  CoinHistory,
  CoinSide,
  PokemonInPlay,
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

/**
 * Nombre de pièces à lancer pour une attaque :
 * `coinCountPerAttachedEnergy` (une pièce par Énergie de ce type attachée)
 * ou `coinCount` (nombre fixe).
 */
/** Pièces de vérification à lancer avant d'attaquer (effet adverse), ou null. */
export function getPendingAttackCoinCheck(
  pokemon: PokemonInPlay,
  turnId: number
): { coinCount: number; failsOn: CoinSide } | null {
  const check = pokemon.attackCoinCheck;

  if (!check || check.endPlayer !== pokemon.owner || pokemon.attackCoinCheckResultTurnId === turnId) {
    return null;
  }

  return { coinCount: check.coinCount, failsOn: check.failsOn };
}

/** Le lancer de vérification de ce tour a-t-il fait rater l'attaque ? */
export function hasFailedAttackCoinCheck(pokemon: PokemonInPlay, turnId: number): boolean {
  return pokemon.attackCoinCheckResultTurnId === turnId && pokemon.attackCoinCheckFailed === true;
}

export function getAttackCoinCount(attack: Attack, pokemon: PokemonInPlay): number {
  if (attack.coinCountPerAttachedEnergy) {
    return pokemon.energies.filter(
      (energy) => energy === attack.coinCountPerAttachedEnergy
    ).length;
  }

  return attack.coinCount ?? 0;
}

/**
 * Effet d'attaque 'coinCheckBeforeTargetAttackNextTurn' : le Pokémon ciblé devra,
 * s'il attaque pendant son prochain tour, lancer `amount` pièces (2 par défaut) ;
 * s'il obtient au moins un `failsOn` (PILE par défaut), son attaque ne fait rien.
 */
export function getCoinCheckForTarget(
  effects: AttackEffect[] | undefined,
  target: PokemonInPlay
): { coinCount: number; failsOn: CoinSide; endPlayer: PokemonInPlay['owner'] } | null {
  const effect = effects?.find(
    (candidate) => candidate.type === 'coinCheckBeforeTargetAttackNextTurn'
  );

  if (!effect) return null;

  return {
    coinCount: effect.amount > 0 ? effect.amount : 2,
    failsOn: 'pile',
    endPlayer: target.owner,
  };
}
