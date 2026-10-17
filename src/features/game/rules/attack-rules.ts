import type {
  Attack,
  BoardState,
  CoinSide,
  EnergyType,
  GameCard,
  Player,
  PokemonInPlay,
} from '@/features/game/types';
import { getPokemonMaxHp } from './board-rules';
import { calculateCoinDamage } from './coin-rules';


export function getDisplayedAttackDamage(
  pokemon: PokemonInPlay,
  attack: Attack,
  coinResult: CoinSide[] | undefined,
  board: BoardState,
  selectedPokemonCell: string | null,
  turnId: number,
  round: number,
  player1Discard: GameCard[] = [],
  player2Discard: GameCard[] = []
): number {


  const globalDamageEffect = attack.effects?.find(
    (effect) =>
      effect.type === 'damageEveryoneIgnoringEffects'
  );

  if (globalDamageEffect) {
    return globalDamageEffect.amount;
  }


  if (attack.fixedDamage !== undefined) {
    return attack.fixedDamage;
  }

  let damage = coinResult ? calculateCoinDamage(attack, coinResult) : attack.damage;

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
