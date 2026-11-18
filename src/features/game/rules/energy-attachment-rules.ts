
import type {
  AttackEffect,
  PokemonInPlay,
} from '@/features/game/types';
import { isScriptPrevented } from './script-modifiers';

// Origine de l'énergie selon les règles de notre jeu.
export type EnergyAttachmentSource =
  | 'hand'
  | 'field'
  | 'discard';

// Vérifie si une énergie peut être attachée.
export function canAttachEnergyFromSource(
  pokemon: PokemonInPlay,
  source: EnergyAttachmentSource
): boolean {
  if (
    source === 'hand' &&
    pokemon.blockedHandEnergyUntilOwnTurnEnd === true
  ) {
    return false;
  }

  // Code des cartes : « ne peut plus recevoir d'Énergie de la main ».
  if (source === 'hand' && isScriptPrevented(pokemon, 'energy')) {
    return false;
  }

  return true;
}

// Applique l'interdiction au Pokémon touché.
export function applyHandEnergyBlockFromAttack(
  pokemon: PokemonInPlay,
  effects: AttackEffect[] | undefined,
  effectsPrevented: boolean
): PokemonInPlay {
  if (effectsPrevented) {
    return pokemon;
  }

  const hasBlockEffect = effects?.some(
    (effect) =>
      effect.type === 'blockEnergyAttachmentFromHand'
  );

  if (!hasBlockEffect) {
    return pokemon;
  }

  return {
    ...pokemon,
    blockedHandEnergyUntilOwnTurnEnd: true,
  };
}
