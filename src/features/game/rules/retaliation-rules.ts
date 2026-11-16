import type { Attack, AttackEffect, BoardState, PokemonInPlay } from '@/features/game/types';
import { getPokemonMaxHp } from './board-rules';
import { isTalentNegated } from './talent-negation';

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
  damageDealt: number,
  // Facultatifs : nécessaires pour le Talent (savoir si le Pokémon est actif).
  board?: BoardState,
  damagedCell?: string
): number {
  // Pas d'attaquant, pas de dégâts, ou attaque de son propre camp : rien.
  if (!attacker || damageDealt <= 0 || attacker.owner === damagedPokemon.owner) {
    return 0;
  }

  let total = 0;

  // 1) Effet d'attaque (déjà existant) : contre-coup pendant le prochain tour adverse.
  if (
    damagedPokemon.retaliationDamage &&
    damagedPokemon.retaliationEndPlayer === attacker.owner
  ) {
    total += damagedPokemon.retaliationDamage;
  }

  // 2) Talent : si ce Pokémon est ACTIF, l'attaquant subit X dégâts.
  const talent = damagedPokemon.card.talent;
  if (
    talent?.effect === 'damageAttackerWhenDamagedWhileActive' &&
    board &&
    damagedCell &&
    isActivePokemonCell(board, damagedCell) &&
    !isTalentNegated(damagedPokemon, board, damagedCell)
  ) {
    total += talent.amount ?? 20;
  }

  return total;
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

/**
 * Vrai si la case est celle du Pokémon actif de son camp :
 * la ligne de jeu (B pour le joueur 1, C pour le joueur 2),
 * ou la ligne arrière (A / D) quand la case devant est vide.
 */
export function isActivePokemonCell(board: BoardState, cell: string): boolean {
  const row = cell[0];
  const column = cell.slice(1);

  if (row === 'B' || row === 'C') return true;
  if (row === 'A') return !board[`B${column}`];
  if (row === 'D') return !board[`C${column}`];
  return false;
}

/**
 * Talent 'burnAttackerWhenDamagedWhileActive' : si ce Pokémon est votre
 * Pokémon actif et qu'il subit les dégâts d'une attaque adverse
 * (même s'il est mis K.O.), le Pokémon attaquant est maintenant Brûlé.
 * `boardBefore` = plateau AVANT les dégâts (pour savoir qui était actif).
 */
export function doesTalentBurnAttacker(
  damagedPokemon: PokemonInPlay,
  damagedCell: string,
  boardBefore: BoardState,
  attacker: PokemonInPlay | null | undefined,
  damageDealt: number
): boolean {
  return (
    !!attacker &&
    damageDealt > 0 &&
    attacker.owner !== damagedPokemon.owner &&
    damagedPokemon.card.talent?.effect === 'burnAttackerWhenDamagedWhileActive' &&
    !isTalentNegated(damagedPokemon, boardBefore, damagedCell) &&
    isActivePokemonCell(boardBefore, damagedCell)
  );
}

/**
 * Brûle le Pokémon attaquant : la brûlure se déclenche à la fin
 * du tour de son propriétaire (donc à la fin du tour en cours),
 * comme une brûlure infligée par une attaque.
 */
export function burnAttackingPokemon(attacker: PokemonInPlay): PokemonInPlay {
  return {
    ...attacker,
    burned: true,
    burnSourcePlayer: attacker.owner,
    burnTriggersRemaining: 2,
  };
}

/**
 * Effet 'bonusDamage' : `amount` dégâts supplémentaires, sans condition.
 * Combiné à une défausse facultative (optional: true), il ne s'applique
 * que si le joueur accepte de défausser.
 */
export function getFlatBonusDamage(effects: AttackEffect[] | undefined): number {
  return (effects ?? [])
    .filter((effect) => effect.type === 'bonusDamage')
    .reduce((total, effect) => total + effect.amount, 0);
}

/**
 * Effet 'bonusDamageIfOpponentHasTypeInPlay' : `amount` dégâts supplémentaires
 * si l'adversaire a au moins un Pokémon de type `pokemonType` en jeu (actif ou banc).
 */
export function getOpponentTypeInPlayBonusDamage(
  effects: AttackEffect[] | undefined,
  board: BoardState,
  attackerOwner: PokemonInPlay['owner']
): number {
  return (effects ?? [])
    .filter((effect) => effect.type === 'bonusDamageIfOpponentHasTypeInPlay')
    .reduce((total, effect) => {
      const hasType = Object.values(board).some(
        (pokemon) =>
          pokemon !== null &&
          pokemon.owner !== attackerOwner &&
          (effect.pokemonType === undefined || pokemon.card.type === effect.pokemonType)
      );

      return hasType ? total + effect.amount : total;
    }, 0);
}

/**
 * Effet 'bonusDamageIfExtraEnergy' : `amount` dégâts supplémentaires si au moins
 * `extraEnergyCount` Énergies `energyType` sont attachées EN PLUS du coût de l'attaque.
 * Le coût incolore est payé d'abord avec les Énergies des autres types.
 */
export function getExtraEnergyBonusDamage(attack: Attack, attacker: PokemonInPlay): number {
  return (attack.effects ?? [])
    .filter((effect) => effect.type === 'bonusDamageIfExtraEnergy' && effect.energyType)
    .reduce((total, effect) => {
      const energyType = effect.energyType!;
      const required = attack.requiredEnergies ?? {};

      const typedCount = attacker.energies.filter((energy) => energy === energyType).length;
      const requiredOfType = required[energyType] ?? 0;

      // Coût restant (incolore) après les Énergies de types précis.
      const requiredTyped = Object.values(required).reduce((sum, value) => sum + (value ?? 0), 0);
      const colorlessCost = Math.max(0, attack.energyCost - requiredTyped);

      // Énergies d'autres types disponibles pour le coût incolore
      // (après avoir payé leurs propres exigences).
      const otherAvailable = attacker.energies.filter((energy) => energy !== energyType).length -
        Object.entries(required)
          .filter(([type]) => type !== energyType)
          .reduce((sum, [, value]) => sum + (value ?? 0), 0);

      const colorlessPaidWithType = Math.max(0, colorlessCost - Math.max(0, otherAvailable));
      const extra = typedCount - requiredOfType - colorlessPaidWithType;

      return extra >= (effect.extraEnergyCount ?? 2) ? total + effect.amount : total;
    }, 0);
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
