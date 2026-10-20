import type { Player, PlayerStatusState, PokemonInPlay } from '@/features/game/types';
import { canAttachEnergyFromSource } from
  './energy-attachment-rules';

export function resolvePokemonEndOfTurn(
  pokemon: PokemonInPlay,
  currentPlayer: Player,
  playerReceivingEnergy: Player,
  poisonDamageBonus = 0
): PokemonInPlay {
  let updatedPokemon = pokemon;

  if (updatedPokemon.owner === playerReceivingEnergy) {
    const passiveEnergyLimit = Math.max(
      0,
      ...updatedPokemon.card.attacks.map((attack) => attack.energyCost)
    );
    
const canReceivePassiveEnergy =
  updatedPokemon.card.type !== 'dragon' &&
  updatedPokemon.energies.length < passiveEnergyLimit &&
  canAttachEnergyFromSource(updatedPokemon, 'hand');


    updatedPokemon = {
      ...updatedPokemon,
      energies: canReceivePassiveEnergy
        ? [...updatedPokemon.energies, updatedPokemon.card.type]
        : updatedPokemon.energies,
      hasAttacked: false,
    };
  }

  if (
  updatedPokemon.poisoned &&
  updatedPokemon.poisonSourcePlayer === currentPlayer
) {
  const poisonDamage =
    updatedPokemon.owner !== currentPlayer
      ? 10 + poisonDamageBonus
      : 10;

  updatedPokemon = {
    ...updatedPokemon,
    currentHp: updatedPokemon.currentHp - poisonDamage,
  };
}

  if (
    updatedPokemon.burned &&
    updatedPokemon.burnSourcePlayer === currentPlayer &&
    updatedPokemon.burnTriggersRemaining > 0
  ) {
    const remaining = updatedPokemon.burnTriggersRemaining - 1;
    updatedPokemon = {
      ...updatedPokemon,
      currentHp: updatedPokemon.currentHp - 20,
      burnTriggersRemaining: remaining,
      burned: remaining > 0,
      burnSourcePlayer: remaining === 0 ? null : updatedPokemon.burnSourcePlayer,
    };
  }

  if (
    updatedPokemon.owner === currentPlayer &&
    updatedPokemon.paralyzed &&
    updatedPokemon.paralysisTurnsRemaining > 0
  ) {
    const remaining = updatedPokemon.paralysisTurnsRemaining - 1;
    updatedPokemon = {
      ...updatedPokemon,
      paralysisTurnsRemaining: remaining,
      paralyzed: remaining > 0,
    };
  }

  if (
    updatedPokemon.owner === currentPlayer &&
    updatedPokemon.confused &&
    updatedPokemon.confusionTurnsRemaining > 0
  ) {
    const remaining = updatedPokemon.confusionTurnsRemaining - 1;
    updatedPokemon = {
      ...updatedPokemon,
      confusionTurnsRemaining: remaining,
      confused: remaining > 0,
    };
  }

  if (updatedPokemon.asleep && updatedPokemon.sleepEndPlayer === currentPlayer) {
    updatedPokemon = {
      ...updatedPokemon,
      asleep: false,
      sleepSourcePlayer: null,
      sleepEndPlayer: null,
    };
  }

  if (updatedPokemon.extraDamageNextTurnSourcePlayer === currentPlayer) {
    updatedPokemon = updatedPokemon.extraDamageNextTurnReady
      ? {
          ...updatedPokemon,
          extraDamageNextTurn: 0,
          extraDamageNextTurnSourcePlayer: null,
          extraDamageNextTurnReady: false,
          extraDamageNextTurnEnergyType: undefined,
        }
      : { ...updatedPokemon, extraDamageNextTurnReady: true };
  }

  if (updatedPokemon.attackDamageReductionEndPlayer === currentPlayer) {
    updatedPokemon = {
      ...updatedPokemon,
      attackDamageReduction: 0,
      attackDamageReductionEndPlayer: null,
    };
  }

  if (
  updatedPokemon
    .preventAllAttackDamageAndEffects &&
  updatedPokemon
    .preventAllAttackDamageAndEffectsEndPlayer ===
    currentPlayer
) {
  updatedPokemon = {
    ...updatedPokemon,

    preventAllAttackDamageAndEffects:
      false,

    preventAllAttackDamageAndEffectsEndPlayer:
      null,
  };
}

if (
  updatedPokemon.temporaryAttackDamageProtection
    ?.expiresAfterPlayerTurn === currentPlayer
) {
  updatedPokemon = {
    ...updatedPokemon,
    temporaryAttackDamageProtection: undefined,
  };
}

// Fin de l'interdiction de retraite
// à la fin du tour du Pokémon concerné.
if (
  updatedPokemon.owner === currentPlayer &&
  updatedPokemon.retreatBlockedUntilOwnTurnEnd
) {
  updatedPokemon = {
    ...updatedPokemon,
    retreatBlockedUntilOwnTurnEnd: false,
  };
}

// L'interdiction disparaît à la fin
// du tour du propriétaire du Pokémon.
if (
  updatedPokemon.owner === currentPlayer &&
  updatedPokemon.blockedHandEnergyUntilOwnTurnEnd
) {
  updatedPokemon = {
    ...updatedPokemon,
    blockedHandEnergyUntilOwnTurnEnd: false,
  };
}

  return updatedPokemon;
}

export function resolvePlayerEndOfTurnStatus(
  status: PlayerStatusState,
  currentPlayer: Player,
  poisonDamageBonus = 0
): { status: PlayerStatusState; damage: number } {
  let nextStatus = status;
  let damage = 0;

  if (status.poisoned && status.poisonSourcePlayer === currentPlayer) {
  damage += 10 + poisonDamageBonus;
}

  if (
    status.burned &&
    status.burnSourcePlayer === currentPlayer &&
    status.burnTriggersRemaining > 0
  ) {
    damage += 20;
    const remaining = status.burnTriggersRemaining - 1;
    nextStatus = {
      ...status,
      burned: remaining > 0,
      burnSourcePlayer: remaining === 0 ? null : status.burnSourcePlayer,
      burnTriggersRemaining: remaining,
    };
  }

  return { status: nextStatus, damage };
}

export function advancePlayerExtraDamage(
  previousStatus: PlayerStatusState,
  currentPlayer: Player
): PlayerStatusState {
  if (previousStatus.extraDamageNextTurnSourcePlayer !== currentPlayer) {
    return previousStatus;
  }

  if (!previousStatus.extraDamageNextTurnReady) {
    return { ...previousStatus, extraDamageNextTurnReady: true };
  }

  return {
    ...previousStatus,
    extraDamageNextTurn: 0,
    extraDamageNextTurnSourcePlayer: null,
    extraDamageNextTurnReady: false,
    
  };
}
