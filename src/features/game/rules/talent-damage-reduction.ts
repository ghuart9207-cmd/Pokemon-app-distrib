import type { PokemonInPlay } from '@/features/game/types';

const DEFAULT_TALENT_REDUCTION = 30;

/**
 * Réduction des dégâts d'attaque accordée par le Talent passif de la cible.
 * - 'reduceDamageFromFireWater' (Azumarill) : seulement contre les attaquants Feu ou Eau ;
 * - 'reduceAllAttackDamage' : contre toutes les attaques.
 * `amount` du Talent = valeur de la réduction (30 par défaut).
 */
export function getTalentDamageReduction(
  target: PokemonInPlay,
  attacker: PokemonInPlay | null | undefined
): number {
  const talent = target.card.talent;

  if (!talent || talent.type !== 'passive' || !attacker) {
    return 0;
  }

  if (talent.effect === 'reduceAllAttackDamage') {
    return talent.amount ?? DEFAULT_TALENT_REDUCTION;
  }

  if (
    talent.effect === 'reduceDamageFromFireWater' &&
    (attacker.card.type === 'feu' || attacker.card.type === 'eau')
  ) {
    return talent.amount ?? DEFAULT_TALENT_REDUCTION;
  }

  return 0;
}
