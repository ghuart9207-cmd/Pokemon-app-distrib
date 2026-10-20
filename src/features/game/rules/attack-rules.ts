import type {
  Attack,
  BoardState,
  CoinSide,
  EnergyType,
  GameCard,
  Player,
  AttackEffect,
  PokemonInPlay,
} from '@/features/game/types';
import { getPokemonMaxHp } from './board-rules';
import { calculateCoinDamage } from './coin-rules';


export function getAttachedEnergyBonusDamage(
  energies: EnergyType[],
  effects: AttackEffect[] | undefined
): number {
  let bonus = 0;

  for (const effect of effects ?? []) {
    if (
      effect.type === 'bonusDamageIfAttachedEnergy' &&
      effect.energyType &&
      energies.includes(effect.energyType)
    ) {
      bonus += effect.amount;
    }
  }

  return bonus;
}


export function getDefenderEnergyBonusDamage(
  defender: PokemonInPlay | null,
  effects: AttackEffect[] | undefined
): number {
  if (!defender) {
    return 0;
  }

  let bonus = 0;

  for (const effect of effects ?? []) {
    if (effect.type !== 'bonusDamageIfDefenderHasEnergy') {
      continue;
    }

    // Si un type est précisé, on vérifie ce type.
    // Sinon, n'importe quelle énergie convient.
    const hasRequiredEnergy = effect.energyType
      ? defender.energies.includes(effect.energyType)
      : defender.energies.length > 0;

    if (hasRequiredEnergy) {
      bonus += effect.amount;
    }
  }

  return bonus;
}

export function getOpponentActiveEnergyBonusDamage(
  opponentActive: PokemonInPlay | null,
  effects: AttackEffect[] | undefined
): number {
  if (!opponentActive || opponentActive.energies.length === 0) {
    return 0;
  }

  return (effects ?? [])
    .filter(
      (effect) =>
        effect.type === 'bonusDamageIfOpponentActiveHasEnergy'
    )
    .reduce((total, effect) => total + effect.amount, 0);
}


export function getDamagePerAttachedEnergy(
  pokemon: PokemonInPlay,
  attack: Attack
): number {
  const effect = attack.effects?.find(
    (effect) =>
      effect.type === 'damagePerAttachedEnergy'
  );

  if (!effect) {
    return 0;
  }

  const energyCount = pokemon.energies.length;

  return energyCount * effect.amount;
}

/**
 * Remplace les dégâts de base d'une attaque si un effet temporaire
 * est actif pendant ce tour pour cette attaque.
 */
export function getAttackWithBaseDamageOverride(
  pokemon: PokemonInPlay,
  attack: Attack,
  turnId: number
): Attack {
  if (
    attack.fixedDamage !== undefined ||
    pokemon.nextTurnAttackBaseDamageTurnId !== turnId ||
    pokemon.nextTurnAttackBaseDamageAttackName !== attack.name ||
    pokemon.nextTurnAttackBaseDamage === undefined
  ) {
    return attack;
  }

  return {
    ...attack,
    damage: pokemon.nextTurnAttackBaseDamage,
  };
}

/**
 * Bonus de dégâts si le Pokémon attaquant possède
 * au moins une carte Outil attachée.
 */
export function getToolAttachedAttackBonus(
  pokemon: PokemonInPlay,
  attack: Attack
): number {
  if (!pokemon.attachedTool) {
    return 0;
  }

  return (attack.effects ?? []).reduce(
    (total, effect) =>
      effect.type === 'bonusDamageIfToolAttached'
        ? total + effect.amount
        : total,
    0
  );
}

export function getOpponentPlayerSpecialConditionBonus(
  attack: Attack,
  opponentPlayerPoisoned: boolean,
  opponentPlayerBurned: boolean
): number {
  const effect = attack.effects?.find(
    (item) =>
      item.type ===
      'bonusDamagePerOpponentActiveSpecialCondition'
  );

  if (!effect) {
    return 0;
  }

  const conditionCount = [
    opponentPlayerPoisoned,
    opponentPlayerBurned,
  ].filter(Boolean).length;

  return conditionCount * effect.amount;
}

/**
 * Ajoute des dégâts pour chaque état spécial
 * affectant le Pokémon actif adverse.
 */
export function getOpponentActiveSpecialConditionBonus(
  pokemon: PokemonInPlay,
  attack: Attack,
  board: BoardState,
  selectedPokemonCell: string | null
): number {
  const effect = attack.effects?.find(
    (item) =>
      item.type ===
      'bonusDamagePerOpponentActiveSpecialCondition'
  );

  if (!effect || !selectedPokemonCell) {
    return 0;
  }

  const column = selectedPokemonCell.substring(1);

  const targetCells =
    pokemon.owner === 1
      ? [`C${column}`, `D${column}`]
      : [`B${column}`, `A${column}`];

  const targetCell = targetCells.find(
    (cell) => board[cell] !== null
  );

  const target = targetCell ? board[targetCell] : null;

  if (!target) {
    return 0;
  }

  const specialConditionCount = [
    target.poisoned,
    target.burned,
    target.paralyzed,
    target.asleep,
    target.confused,
  ].filter(Boolean).length;

  return specialConditionCount * effect.amount;
}

export function getDisplayedAttackDamage(
  pokemon: PokemonInPlay,
  originalAttack: Attack,
  coinResult: CoinSide[] | undefined,
  board: BoardState,
  selectedPokemonCell: string | null,
  turnId: number,
  round: number,
  opponentPlayerPoisoned: boolean = false,
  opponentPlayerBurned: boolean = false,
  player1Discard: GameCard[] = [],
  player2Discard: GameCard[] = []

): number {
const attack = getAttackWithBaseDamageOverride(
  pokemon,
  originalAttack,
  turnId
);

  const globalDamageEffect = attack.effects?.find(
    (effect) =>
      effect.type === 'damageEveryoneIgnoringEffects' ||
effect.type === 'damageAllPokemonWithTalent'
  );

  if (globalDamageEffect) {
  return (
    globalDamageEffect.amount +
    getToolAttachedAttackBonus(pokemon, attack)
  );
}


  if (attack.fixedDamage !== undefined) {
  return (
    attack.fixedDamage +
    getToolAttachedAttackBonus(pokemon, attack) +
    getOpponentActiveSpecialConditionBonus(
      pokemon,
      attack,
      board,
      selectedPokemonCell
    )
  );
}

  let damage = coinResult ? calculateCoinDamage(attack, coinResult) : attack.damage;
  damage += getOpponentActiveSpecialConditionBonus(
  pokemon,
  attack,
  board,
  selectedPokemonCell
);
  damage += getToolAttachedAttackBonus(pokemon, attack);

damage += getAttachedEnergyBonusDamage(
  pokemon.energies,
  attack.effects
);

damage += getDamagePerAttachedEnergy(
  pokemon,
  attack
);

  // Bonus selon les cartes dans la défausse du propriétaire
  
const ownDiscard =
  pokemon.owner === 1
    ? player1Discard
    : player2Discard;

if (attack.bonusDamagePerOwnDiscardCard) {
  const { cardId, amount } =
    attack.bonusDamagePerOwnDiscardCard;

  const matchingCards = ownDiscard.filter(
    (card) => card.id === cardId
  ).length;

  damage += matchingCards * amount;
}


  const switchedRecently =
    pokemon.lastSwitchedTurnId !== undefined &&
    (pokemon.lastSwitchedTurnId === turnId || pokemon.lastSwitchedTurnId === turnId - 1);

  if (switchedRecently) {
    damage += attack.bonusDamageIfSwitchedRecently ?? 0;
  }

  damage += Math.floor(round / 2) * (attack.bonusDamageEveryTwoRounds ?? 0);

 

  const discardAllBonus = attack.effects?.find(
    (effect) => effect.type === 'discardAllTypedEnergyForBonus' && effect.energyType
  );

  if (discardAllBonus?.energyType) {
    const matchingEnergyCount = pokemon.energies.filter(
      (energy) => energy === discardAllBonus.energyType
    ).length;
    damage += matchingEnergyCount * discardAllBonus.amount;
  }

  if (selectedPokemonCell) {
    const column = selectedPokemonCell.substring(1);
    const targetCells =
      pokemon.owner === 1 ? [`C${column}`, `D${column}`] : [`B${column}`, `A${column}`];
    const targetCell = targetCells.find((cell) => board[cell] !== null);
    const target = targetCell ? board[targetCell] : null;
    // Bonus affiché si le Pokémon ciblé
// ou le joueur adverse est empoisonné.
const poisonedBonusEffect = attack.effects?.find(
  (effect) =>
    effect.type === 'bonusDamageIfTargetPoisoned'
);

if (
  poisonedBonusEffect &&
  (
    target?.poisoned === true ||
    opponentPlayerPoisoned
  )
) {
  damage += poisonedBonusEffect.amount;
}
damage += getDefenderEnergyBonusDamage(
  target,
  attack.effects
);
damage += getOpponentActiveEnergyBonusDamage(
  target,
  attack.effects
);

    const opponentBenchCount = Object.entries(board).filter(
      ([cellName, boardPokemon]) =>
        boardPokemon !== null &&
        boardPokemon.owner !== pokemon.owner &&
        (targetCell ? cellName !== targetCell : true)
    ).length;

    damage += opponentBenchCount * (attack.bonusDamagePerOpponentBenchPokemon ?? 0);

    if (target && attack.bonusDamageIfTargetEvolved && target.card.stage !== 'base') {
      damage += attack.bonusDamageIfTargetEvolved;
    }
    if (target && attack.bonusDamageIfTargetNotEvolved && target.card.stage === 'base' ) {
      damage += attack.bonusDamageIfTargetNotEvolved;
    }
        const retreatCostBonusEffect = attack.effects?.find(
      (effect) => effect.type === 'bonusDamagePerTargetRetreatCost'
    );

    if (target && retreatCostBonusEffect) {
      damage +=
        target.card.retreatCost * retreatCostBonusEffect.amount;
    }
  }
// Bonus si le joueur adverse est affecté par un état spécial.
// Ce bonus s'applique uniquement si aucun Pokémon adverse
// ne se trouve dans la colonne ciblée.
if (selectedPokemonCell) {
  const column = selectedPokemonCell.substring(1);

  const targetCells =
    pokemon.owner === 1
      ? [`C${column}`, `D${column}`]
      : [`B${column}`, `A${column}`];

  const hasPokemonTarget = targetCells.some(
    (cell) => board[cell] !== null
  );

  if (!hasPokemonTarget) {
    damage += getOpponentPlayerSpecialConditionBonus(
      attack,
      opponentPlayerPoisoned,
      opponentPlayerBurned
    );
  }
}
  return damage;
}

export function createAttackPaths(startCell: string, player: Player): string[][] {
  const row = startCell[0];
  const column = Number(startCell.slice(1));
  const frontRow = player === 1 ? 'B' : 'C';
  const backRow = player === 1 ? 'A' : 'D';

  const makeColumnCells = (col: number): string[] => {
    if (col === column && row === backRow) {
      return [`${backRow}${col}`];
    }

    return [`${frontRow}${col}`, `${backRow}${col}`];
  };

  const leftPath = makeColumnCells(column);
  const rightPath = makeColumnCells(column);

  for (let col = column - 1; col >= 1; col--) {
    leftPath.push(`${frontRow}${col}`, `${backRow}${col}`);
  }

  for (let col = column + 1; col <= 4; col++) {
    rightPath.push(`${frontRow}${col}`, `${backRow}${col}`);
  }

  const cleanPath = (path: string[]) => {
    const startIndex = path.indexOf(startCell);
    return path.slice(startIndex);
  };

  return [cleanPath(leftPath), cleanPath(rightPath)];
}


export function canPayTypedDiscard(
  energies: EnergyType[],
  attack: Attack
): boolean {
  const remainingEnergies = [...energies];

  for (const effect of attack.effects ?? []) {
    if (
      effect.type !== 'discardTypedEnergy' ||
      !effect.energyType
    ) {
      continue;
    }

    for (let i = 0; i < effect.amount; i++) {
      const index = remainingEnergies.indexOf(
        effect.energyType
      );

      if (index === -1) {
        return false;
      }

      remainingEnergies.splice(index, 1);
    }
  }

  return true;
}


export function canPayAttackCost(energies: EnergyType[], attack: Attack) {
  const requirements = attack.requiredEnergies ?? {};
  let requiredTotal = 0;

  for (const [type, amount] of Object.entries(requirements)) {
    const requiredAmount = amount ?? 0;
    const availableAmount = energies.filter((energy) => energy === type).length;

    if (availableAmount < requiredAmount) {
      return false;
    }

    requiredTotal += requiredAmount;
  }

  return energies.length >= attack.energyCost;
}

export function applyAttackEffects(
  pokemon: PokemonInPlay,
  attack: Attack
): PokemonInPlay {
  let updatedPokemon = { ...pokemon };

// Dégâts déjà subis avant cette attaque.
const damageAlreadyTaken = Math.max(
  0,
  getPokemonMaxHp(pokemon) - pokemon.currentHp
);

  if (!attack.effects) {
    return updatedPokemon;
  }

  for (const effect of attack.effects) {
    
if (
  effect.type ===
    'preventDamageFromStageOrVariantNextOpponentTurn' &&
  (effect.blockedStage || effect.blockedVariant)
) {
  updatedPokemon = {
    ...updatedPokemon,
    temporaryAttackDamageProtection: {
      stage: effect.blockedStage,
      variant: effect.blockedVariant,
      expiresAfterPlayerTurn:
        pokemon.owner === 1 ? 2 : 1,
    },
  };
}

    if (effect.type === 'heal') {
      updatedPokemon = {
        ...updatedPokemon,
        currentHp: Math.min(
          updatedPokemon.currentHp + effect.amount,
          getPokemonMaxHp(updatedPokemon)
        ),
      };
    }

    if (effect.type === 'discardEnergy') {
      updatedPokemon = {
        ...updatedPokemon,
        energies: updatedPokemon.energies.slice(
          0,
          Math.max(0, updatedPokemon.energies.length - effect.amount)
        ),
      };
    }

    if (effect.type === 'recoil') {
      updatedPokemon = {
        ...updatedPokemon,
        currentHp: updatedPokemon.currentHp - effect.amount,
      };
    }
    // S'AUTO-INFLIGER AUTANT DE DÉGÂTS
// QUE LE POKÉMON EN A DÉJÀ SUBIS.
if (effect.type === 'selfDamageEqualToDamageTaken') {
  updatedPokemon = {
    ...updatedPokemon,
    currentHp:
      updatedPokemon.currentHp - damageAlreadyTaken,
  };
}
    if (
  effect.type ===
  'preventAllAttackDamageAndEffectsNextOpponentTurn'
) {
  updatedPokemon = {
    ...updatedPokemon,

    preventAllAttackDamageAndEffects:
      true,

    preventAllAttackDamageAndEffectsEndPlayer:
      pokemon.owner === 1 ? 2 : 1,
  };
}
  }

  

  return updatedPokemon;
}
