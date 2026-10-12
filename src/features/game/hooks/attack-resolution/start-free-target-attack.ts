import type {
  Attack,
  CoinSide,
  EnergyType,
  Player,
  PokemonCard,
  PokemonInPlay,
  TrainerCard,
} from '@/features/game/types';
import type { AttackResolutionContext } from './attack-resolution-context';

/** Attaque à cible libre : prépare le choix du Pokémon adverse (ou du joueur adverse) à toucher. */
export function startFreeTargetAttack(
  context: AttackResolutionContext,
  locals: {
    attack: Attack;
    attacker: PokemonInPlay;
    attackerAfterConfusion: {
      currentHp: number;
      card: PokemonCard;
      owner: Player;
      energies: EnergyType[];
      attachedTool: TrainerCard | null;
      hasAttacked: boolean;
      hasRetreated: boolean;
      isInvocation?: boolean | undefined;
      lastSwitchedTurnId?: number | undefined;
      poisoned: boolean;
      poisonSourcePlayer: Player | null;
      burned: boolean;
      burnSourcePlayer: Player | null;
      burnTriggersRemaining: number;
      paralyzed: boolean;
      paralysisTurnsRemaining: number;
      confused: boolean;
      confusionTurnsRemaining: number;
      asleep: boolean;
      sleepSourcePlayer: Player | null;
      sleepEndPlayer: Player | null;
      coinHistory: Partial<Record<number, CoinSide[]>>;
      extraDamageNextTurn?: number | undefined;
      extraDamageNextTurnSourcePlayer?: Player | null | undefined;
      extraDamageNextTurnReady?: boolean | undefined;
      blockedAttackName?: string | null | undefined;
      blockedAttackTurnId?: number | null | undefined;
      attackDamageReduction?: number | undefined;
      attackDamageReductionEndPlayer?: Player | null | undefined;
    };
    newBoard: { [x: string]: PokemonInPlay | null };
    resolvedAttack: Attack;
    selectedPokemonCell: string;
    totalDamage: number;
  }
): void {
  const {
    setBoard,
    setMessage,
    setPendingOpponentTarget,
    setPlayer1DiscardEnergies,
    setPlayer2DiscardEnergies,
    turnId,
  } = context;
  const {
    attack,
    attacker,
    attackerAfterConfusion,
    newBoard,
    resolvedAttack,
    selectedPokemonCell,
    totalDamage,
  } = locals;
  let specialAttacker = {
    ...attackerAfterConfusion,

    hasAttacked: true,

    blockedAttackName: attack.blocksNextOwnTurn
      ? attack.name
      : attackerAfterConfusion.blockedAttackName,

    blockedAttackTurnId: attack.blocksNextOwnTurn
      ? turnId + 2
      : attackerAfterConfusion.blockedAttackTurnId,
  };

  const typedDiscardEffect = resolvedAttack.effects?.find(
    (effect) => effect.type === 'discardTypedEnergy' && effect.energyType
  );

  if (typedDiscardEffect && typedDiscardEffect.energyType) {
    const remainingEnergies = [...specialAttacker.energies];

    const discardedEnergies: EnergyType[] = [];

    for (let i = 0; i < typedDiscardEffect.amount; i++) {
      const energyIndex = remainingEnergies.findIndex(
        (energy) => energy === typedDiscardEffect.energyType
      );

      if (energyIndex === -1) {
        break;
      }

      discardedEnergies.push(remainingEnergies[energyIndex]);

      remainingEnergies.splice(energyIndex, 1);
    }

    specialAttacker = {
      ...specialAttacker,
      energies: remainingEnergies,
    };

    if (attacker.owner === 1) {
      setPlayer1DiscardEnergies((previous) => [...previous, ...discardedEnergies]);
    } else {
      setPlayer2DiscardEnergies((previous) => [...previous, ...discardedEnergies]);
    }
  }

  newBoard[selectedPokemonCell] = specialAttacker;

  setBoard(newBoard);

  setPendingOpponentTarget({
    player: attacker.owner,

    attackerCell: selectedPokemonCell,

    damage: totalDamage,

    mode:
      attack.targetMode === 'damagedOpponentOrPlayer'
        ? 'damagedOpponentOrPlayer'
        : 'anyOpponentPokemon',

    excludedCell: null,
  });

  setMessage(
    attack.targetMode === 'damagedOpponentOrPlayer'
      ? `${attacker.card.name} utilise ${attack.name}. Choisis un Pokémon adverse blessé ou la carte du joueur adverse s’il a déjà subi des dégâts.`
      : `${attacker.card.name} utilise ${attack.name}. Choisis un Pokémon adverse ou la carte du joueur adverse.`
  );
}
