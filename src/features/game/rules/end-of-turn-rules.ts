import type { Player, PlayerStatusState, PokemonInPlay } from '@/features/game/types';

export function resolvePokemonEndOfTurn(
  pokemon: PokemonInPlay,
  currentPlayer: Player,
  playerReceivingEnergy: Player
): PokemonInPlay {
  let updatedPokemon = pokemon;

  if (updatedPokemon.owner === playerReceivingEnergy) {
    const passiveEnergyLimit = Math.max(
      0,
      ...updatedPokemon.card.attacks.map((attack) => attack.energyCost)
    );
    
const canReceivePassiveEnergy =
  updatedPokemon.card.type !== 'dragon' &&
  updatedPokemon.energies.length < passiveEnergyLimit;


    updatedPokemon = {
      ...updatedPokemon,
      energies: canReceivePassiveEnergy
        ? [...updatedPokemon.energies, updatedPokemon.card.type]
        : updatedPokemon.energies,
      hasAttacked: false,
    };
  }

  if (updatedPokemon.poisoned && updatedPokemon.poisonSourcePlayer === currentPlayer) {
    updatedPokemon = {
      ...updatedPokemon,
      currentHp: updatedPokemon.currentHp - 10,
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

  return updatedPokemon;
}

export function resolvePlayerEndOfTurnStatus(
  status: PlayerStatusState,
  currentPlayer: Player
): { status: PlayerStatusState; damage: number } {
  let nextStatus = status;
  let damage = 0;

  if (status.poisoned && status.poisonSourcePlayer === currentPlayer) {
    damage += 10;
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
