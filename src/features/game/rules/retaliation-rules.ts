import type { AttackEffect, PokemonInPlay } from '@/features/game/types';

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
