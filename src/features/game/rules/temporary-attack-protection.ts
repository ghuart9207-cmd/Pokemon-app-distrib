
import type {
  PokemonInPlay,
} from '@/features/game/types';

export function doesTemporaryProtectionPreventDamage(
  target: PokemonInPlay,
  attacker: PokemonInPlay
): boolean {
  const protection =
    target.temporaryAttackDamageProtection;

  if (!protection) {
    return false;
  }

  if (target.owner === attacker.owner) {
    return false;
  }

  if (
    protection.expiresAfterPlayerTurn !==
    attacker.owner
  ) {
    return false;
  }

  const stageMatches =
    protection.stage !== undefined &&
    attacker.card.stage === protection.stage;

  const variantMatches =
    protection.variant !== undefined &&
    attacker.card.variant === protection.variant;

  return stageMatches || variantMatches;
}
