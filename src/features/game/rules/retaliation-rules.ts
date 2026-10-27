import type { AttackEffect, BoardState, PokemonInPlay } from '@/features/game/types';
import { getPokemonMaxHp } from './board-rules';

/**
 * Effet d'attaque 'retaliateDamageNextOpponentTurn' :
 * « Pendant le prochain tour de votre adversaire, si ce Pokémon subit les dégâts
 * d'une attaque (même s'il est mis K.O.), placez X marqueurs de dégâts sur le
 * Pokémon attaquant. »
 *
 * Renvoie les dégâts à placer sur l'attaquant (0 si rien ne se déclenche).
 * Ce sont des marqueurs : pas de faiblesse, résistance ni réduction.
 */
export function getRetaliationDamage(
  damagedPokemon: PokemonInPlay,
  attacker: PokemonInPlay | null | undefined,
  damageDealt: number
): number {
  if (
    !attacker ||
    damageDealt <= 0 ||
    attacker.owner === damagedPokemon.owner ||
    !damagedPokemon.retaliationDamage ||
    damagedPokemon.retaliationEndPlayer !== attacker.owner
  ) {
    return 0;
  }

  return damagedPokemon.retaliationDamage;
}

/**
 * Effet 'preventAllAttackDamageNextOpponentTurn' :
 * ce Pokémon évite tous les DÉGÂTS des attaques adverses pendant le prochain
 * tour de l'adversaire (les autres effets des attaques s'appliquent quand même).
 */
export function isAttackDamagePreventedByEffect(
  target: PokemonInPlay,
  attacker: PokemonInPlay | null | undefined
): boolean {
  return (
    !!attacker &&
    target.preventAttackDamage === true &&
    target.preventAttackDamageEndPlayer === attacker.owner
  );
}

/**
 * Effet 'preventTargetHealingNextOpponentTurn' : le Pokémon défenseur
 * ne peut pas être soigné jusqu'à la fin du prochain tour de son propriétaire.
 */
export function isHealBlocked(pokemon: PokemonInPlay | null | undefined): boolean {
  return !!pokemon?.healBlockedEndPlayer;
}

/**
 * Effet 'bonusDamageIfTargetType' : X dégâts supplémentaires si le Pokémon
 * ciblé est du type `pokemonType`. Plusieurs effets peuvent être mis
 * (un par type) : on additionne ceux qui correspondent.
 */
export function getTargetTypeBonusDamage(
  effects: AttackEffect[] | undefined,
  target: PokemonInPlay | null | undefined
): number {
  if (!target || !effects) return 0;

  return effects
    .filter(
      (effect) =>
        effect.type === 'bonusDamageIfTargetType' &&
        effect.pokemonType !== undefined &&
        effect.pokemonType === target.card.type
    )
    .reduce((total, effect) => total + effect.amount, 0);
}

/**
 * Effet 'damagePerAllBenchPokemon' : X dégâts pour chaque Pokémon de banc,
 * les vôtres ET ceux de l'adversaire. On compte tous les Pokémon en jeu sauf
 * l'attaquant et le Pokémon qui subit l'attaque (les joueurs ne comptent pas).
 */
/**
 * Effet 'damagePerSelfDamageCounter' : `amount` dégâts supplémentaires
 * pour chaque marqueur de dégâts (10 PV perdus) sur le Pokémon attaquant.
 */
export function getSelfDamageCounterBonusDamage(
  effects: AttackEffect[] | undefined,
  attacker: PokemonInPlay | null | undefined
): number {
  const effect = effects?.find((candidate) => candidate.type === 'damagePerSelfDamageCounter');
  if (!effect || !attacker) return 0;

  const counters = Math.max(0, Math.floor((getPokemonMaxHp(attacker) - attacker.currentHp) / 10));
  return counters * effect.amount;
}

export function getAllBenchBonusDamage(
  effects: AttackEffect[] | undefined,
  board: BoardState,
  attackerCell: string,
  targetCell: string | null | undefined
): number {
  const effect = effects?.find((candidate) => candidate.type === 'damagePerAllBenchPokemon');
  if (!effect) return 0;

  const benchCount = Object.entries(board).filter(
    ([cell, pokemon]) => pokemon !== null && cell !== attackerCell && cell !== targetCell
  ).length;

  return benchCount * effect.amount;
}
