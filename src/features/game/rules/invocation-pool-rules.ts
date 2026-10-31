import type { AttackEffect, GameCard, PokemonCard } from '@/features/game/types';

import { isPokemonCard } from './board-rules';

/**
 * Attaques qui invoquent (effet 'summonFromInvocationPool', ex : Plumeline, Goupix d'Alola) :
 * à la préparation, le joueur choisit `amount` Pokémon (différents ou non) pour chaque
 * Pokémon qui invoque. À chaque utilisation, l'attaque invoque ces Pokémon (sans limite).
 *
 * Filtres possibles : `pokemonType` (ex : 'feu') et `maxHp` (60 par défaut).
 * Les Invocations sont toujours des Pokémon de Base.
 */
export const DEFAULT_INVOCATION_MAX_HP = 60;

/**
 * Pokémon choisis pour chaque Pokémon qui invoque (clé = id de la carte qui invoque).
 * Liste vide : aucun Pokémon possible dans la série.
 */
export type SummonChoices = Record<string, PokemonCard[]>;

/** Nombre de Pokémon à choisir (et invoqués à chaque attaque) pour cet effet. */
export function getSummonChoiceCount(rule: AttackEffect): number {
  return Math.max(1, rule.amount);
}

/** Effet d'Invocation « à choisir » d'une carte (attaque ou Talent), ou null. */
export function getSummonChoiceEffect(card: PokemonCard): AttackEffect | null {
  // Talent « une fois par tour, invoquez … » : même choix à la préparation.
  if (card.talent?.effect === 'summonOncePerTurn') {
    return {
      type: 'summonFromInvocationPool',
      amount: card.talent.amount ?? 1,
      pokemonType: card.talent.targetPokemonType,
      maxHp: card.talent.maxHp,
    };
  }

  for (const attack of card.attacks) {
    const effect = attack.effects?.find(
      (candidate) => candidate.type === 'summonFromInvocationPool'
    );

    if (effect) return effect;
  }

  return null;
}

/** La carte peut-elle être choisie comme Invocation pour cet effet ? */
export function isValidAttackInvocation(card: PokemonCard, rule: AttackEffect): boolean {
  return (
    card.stage === 'base' &&
    card.maxHp <= (rule.maxHp ?? DEFAULT_INVOCATION_MAX_HP) &&
    (rule.pokemonType === undefined || card.type === rule.pokemonType)
  );
}

/**
 * Prochain Pokémon qui invoque et dont l'Invocation n'a pas encore été choisie.
 * On regarde le deck, les Invocations du Fan Club, puis les Pokémon déjà choisis
 * comme Invocations (une Invocation peut elle-même invoquer).
 */
export function getNextSummonerNeedingChoice(
  sources: GameCard[],
  choices: SummonChoices
): PokemonCard | null {
  const queue: PokemonCard[] = [
    ...sources.filter(isPokemonCard),
    ...Object.values(choices).flat(),
  ];
  const seen = new Set<string>();

  for (let index = 0; index < queue.length; index++) {
    const card = queue[index];
    if (seen.has(card.id)) continue;
    seen.add(card.id);

    if (getSummonChoiceEffect(card) && !(card.id in choices)) {
      return card;
    }

    queue.push(...(choices[card.id] ?? []));
  }

  return null;
}

/** Texte de la règle, ex : « Pokémon Feu de Base ayant 60 PV ou moins ». */
export function describeAttackInvocationRule(rule: AttackEffect): string {
  const typeText = rule.pokemonType ? ` ${TYPE_LABELS[rule.pokemonType] ?? rule.pokemonType}` : '';

  return `Pokémon${typeText} de Base ayant ${rule.maxHp ?? DEFAULT_INVOCATION_MAX_HP} PV ou moins`;
}

const TYPE_LABELS: Record<string, string> = {
  electrique: 'Électrique',
  feu: 'Feu',
  eau: 'Eau',
  plante: 'Plante',
  psy: 'Psy',
  combat: 'Combat',
  normal: 'Normal',
  obscurite: 'Obscurité',
  metal: 'Métal',
  fee: 'Fée',
  dragon: 'Dragon',
};
