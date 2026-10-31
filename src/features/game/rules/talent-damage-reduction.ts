import type { PokemonInPlay } from '@/features/game/types';
import type { BoardState } from '@/features/game/types';
import { findPokemonCell, isTalentNegated } from './talent-negation';
import { isActivePokemonCell } from './retaliation-rules';

const DEFAULT_TALENT_REDUCTION = 30;

/**
 * Réduction des dégâts d'attaque accordée par le Talent passif de la cible.
 * - 'reduceDamageFromFireWater' (Azumarill) : seulement contre les attaquants Feu ou Eau ;
 * - 'reduceAllAttackDamage' : contre toutes les attaques.
 * `amount` du Talent = valeur de la réduction (30 par défaut).
 */
export function getTalentDamageReduction(
  target: PokemonInPlay,
  attacker: PokemonInPlay | null | undefined,
  // Plateau : pour savoir si le Talent est annulé (Talent qui annule les GX/EX).
  board?: BoardState
): number {
  return getTargetTalentReduction(target, attacker, board) + getAttackerColumnDamageReduction(attacker, board);
}

/**
 * Talent 'reduceOpposingColumnAttackDamage' (ex : Luxray) : tant que ce Pokémon est
 * le Pokémon actif de sa colonne (personne devant lui), les attaques des Pokémon
 * adverses de cette colonne infligent `amount` (30) dégâts de moins à CHAQUE
 * Pokémon touché (et au joueur touché), même si l'attaque vise un autre Pokémon.
 */
export function getAttackerColumnDamageReduction(
  attacker: PokemonInPlay | null | undefined,
  board: BoardState | null | undefined,
  attackerCell?: string | null
): number {
  if (!attacker || !board) return 0;

  const cell = attackerCell ?? findPokemonCell(board, attacker);
  if (!cell) return 0;

  const column = cell.slice(1);

  return Object.entries(board).reduce((total, [otherCell, other]) => {
    if (
      !other ||
      other.owner === attacker.owner ||
      otherCell.slice(1) !== column ||
      !isActivePokemonCell(board, otherCell) ||
      other.card.talent?.type !== 'passive' ||
      other.card.talent.effect !== 'reduceOpposingColumnAttackDamage' ||
      isTalentNegated(other, board, otherCell)
    ) {
      return total;
    }

    return total + (other.card.talent.amount ?? DEFAULT_TALENT_REDUCTION);
  }, 0);
}

/**
 * Talent 'preventDamageToTypeFromToolAttackers' : tant que ce Pokémon est en jeu,
 * vos Pokémon de type `targetPokemonType` (Métal par défaut) évitent tous les
 * dégâts des attaques des Pokémon adverses auxquels un Outil est attaché.
 */
export function doesToolAttackerShieldPreventDamage(
  target: PokemonInPlay,
  attacker: PokemonInPlay | null | undefined,
  board: BoardState | null | undefined
): boolean {
  if (!attacker || !board || !attacker.attachedTool || attacker.owner === target.owner) {
    return false;
  }

  return Object.entries(board).some(
    ([cell, pokemon]) =>
      pokemon !== null &&
      pokemon.owner === target.owner &&
      pokemon.card.talent?.type === 'passive' &&
      pokemon.card.talent.effect === 'preventDamageToTypeFromToolAttackers' &&
      target.card.type === (pokemon.card.talent.targetPokemonType ?? 'metal') &&
      !isTalentNegated(pokemon, board, cell)
  );
}

function getTargetTalentReduction(
  target: PokemonInPlay,
  attacker: PokemonInPlay | null | undefined,
  board?: BoardState
): number {
  const talent = target.card.talent;

  if (!talent || talent.type !== 'passive' || !attacker || isTalentNegated(target, board)) {
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
