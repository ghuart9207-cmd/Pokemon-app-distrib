import type {
  Attack,
  BoardState,
  CoinSide,
  EnergyType,
  GameCard,
  Player,
  AttackEffect,
  PlayerAttackBonus,
  PokemonInPlay,
} from '@/features/game/types';
import { getPokemonMaxHp, isPokemonCard } from './board-rules';
import {
  getAllBenchBonusDamage,
  getSelfDamageCounterBonusDamage,
  getTargetTypeBonusDamage,
} from './retaliation-rules';
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
function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    // « Lame Royale », « Lames Royal », « Lames Royales » sont équivalents.
    .map((word) => word.replace(/(es|e|s)$/, ''))
    .join(' ');
}

/**
 * Bonus de dégâts d'une carte Supporter jouée ce tour (ex : Cynthia)
 * pour cette attaque de ce Pokémon.
 */
export function getPlayerAttackBonus(
  pokemon: PokemonInPlay,
  attack: Attack,
  bonuses: PlayerAttackBonus[] | undefined
): number {
  if (!bonuses || bonuses.length === 0 || attack.fixedDamage !== undefined) {
    return 0;
  }

  const pokemonName = normalizeForMatch(pokemon.card.name);
  const attackName = normalizeForMatch(attack.name);

  return bonuses
    .filter(
      (bonus) =>
        pokemonName.startsWith(normalizeForMatch(bonus.pokemonName)) &&
        attackName === normalizeForMatch(bonus.attackName)
    )
    .reduce((total, bonus) => total + bonus.amount, 0);
}

export function getAttackWithBaseDamageOverride(
  pokemon: PokemonInPlay,
  originalAttack: Attack,
  turnId: number,
  attackBonuses?: PlayerAttackBonus[]
): Attack {
  const supporterBonus = getPlayerAttackBonus(pokemon, originalAttack, attackBonuses);
  const attack =
    supporterBonus > 0
      ? { ...originalAttack, damage: originalAttack.damage + supporterBonus }
      : originalAttack;

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
  player2Discard: GameCard[] = [],
  player1Hand: GameCard[] = [],
  player2Hand: GameCard[] = [],
  attackBonuses: PlayerAttackBonus[] = []

): number {
const attack = getAttackWithBaseDamageOverride(
  pokemon,
  originalAttack,
  turnId,
  attackBonuses
);

  const globalDamageEffect = attack.effects?.find(
    (effect) =>
      effect.type === 'damageEveryoneIgnoringEffects' ||
effect.type === 'damageAllPokemonWithTalent'
  );

  // Dégâts à chaque Pokémon adverse + joueur adverse : on affiche le montant.
  const allOpponentsEffect = attack.effects?.find(
    (effect) => effect.type === 'damageAllOpponentPokemonAndPlayer'
  );

  if (allOpponentsEffect) {
    return allOpponentsEffect.amount;
  }

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

  // Bonus si ce Pokémon a des marqueurs de dégâts.
  const selfDamagedBonusEffect = attack.effects?.find(
    (effect) => effect.type === 'bonusDamageIfSelfDamaged'
  );

  if (selfDamagedBonusEffect && pokemon.currentHp < getPokemonMaxHp(pokemon)) {
    damage += selfDamagedBonusEffect.amount;
  }

  // Dégâts selon les cartes en main (total réel du moment).
  const ownHand = pokemon.owner === 1 ? player1Hand : player2Hand;
  const opponentHand = pokemon.owner === 1 ? player2Hand : player1Hand;

  const perOpponentTrainerEffect = attack.effects?.find(
    (effect) => effect.type === 'damagePerOpponentTrainerInHand'
  );

  if (perOpponentTrainerEffect) {
    damage +=
      opponentHand.filter((card) => !isPokemonCard(card)).length *
      perOpponentTrainerEffect.amount;
  }

  const perOwnCardEffect = attack.effects?.find(
    (effect) => effect.type === 'damagePerOwnCardInHand'
  );

  if (perOwnCardEffect) {
    damage += ownHand.length * perOwnCardEffect.amount;
  }

 

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
    if (target && attack.bonusDamageIfTargetGx && target.card.variant === 'gx') {
      damage += attack.bonusDamageIfTargetGx;
    }

    // Bonus selon le type du Pokémon en face.
    damage += getTargetTypeBonusDamage(attack.effects, target);

    // X dégâts pour chaque Pokémon de banc (les deux camps).
    damage += getAllBenchBonusDamage(attack.effects, board, selectedPokemonCell, targetCell);

    // X dégâts pour chaque marqueur sur ce Pokémon.
    damage += getSelfDamageCounterBonusDamage(attack.effects, pokemon);
        const retreatCostBonusEffect = attack.effects?.find(
      (effect) => effect.type === 'bonusDamagePerTargetRetreatCost'
    );

    if (target && retreatCostBonusEffect) {
      damage +=
        target.card.retreatCost * retreatCostBonusEffect.amount;
    }

    // Moins de dégâts selon le coût de retraite du Pokémon en face.
    const retreatCostPenaltyEffect = attack.effects?.find(
      (effect) => effect.type === 'reduceDamagePerTargetRetreatCost'
    );

    if (target && retreatCostPenaltyEffect) {
      damage = Math.max(
        0,
        damage - target.card.retreatCost * retreatCostPenaltyEffect.amount
      );
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
      !effect.energyType ||
      // Une défausse facultative n'est pas obligatoire pour attaquer.
      effect.optional === true
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

    if (effect.type === 'heal' && !updatedPokemon.healBlockedEndPlayer) {
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
    // Évite seulement les DÉGÂTS des attaques au prochain tour adverse.
    if (effect.type === 'preventAllAttackDamageNextOpponentTurn') {
      updatedPokemon = {
        ...updatedPokemon,
        preventAttackDamage: true,
        preventAttackDamageEndPlayer: pokemon.owner === 1 ? 2 : 1,
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
