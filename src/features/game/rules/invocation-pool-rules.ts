import type { AttackEffect, GameCard, PokemonCard, ScriptBlock } from '@/features/game/types';

import { isPokemonCard } from './board-rules';
import { matchesSummonFilter } from './script-cards';

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

/** Code des cartes : premier bloc `summon` avec `pokemon` (Invocation à choisir à la préparation). */
export function findScriptSummonBlock(card: GameCard): ScriptBlock | null {
  const scripts: ScriptBlock[][] = isPokemonCard(card)
    ? [card.talent?.script ?? [], ...card.attacks.map((attack) => attack.script ?? [])]
    : [card.script ?? []];

  const search = (blocks: ScriptBlock[]): ScriptBlock | null => {
    for (const block of blocks) {
      if (block.action === 'summon' && block.pokemon && !block.pokemonName) return block;
      // aussi dans les déclencheurs « si ce Pokémon subit des dégâts »
      const inner = block.script ? search(block.script) : null;
      if (inner) return inner;
    }
    return null;
  };

  for (const blocks of scripts) {
    const found = search(blocks);
    if (found) return found;
  }
  return null;
}

/** Effet d'Invocation « à choisir » d'une carte (attaque, Talent ou Dresseur), ou null. */
export function getSummonChoiceEffect(card: GameCard): AttackEffect | null {
  // Code des cartes : summon avec `pokemon`.
  const scriptBlock = findScriptSummonBlock(card);
  if (scriptBlock?.pokemon) {
    return {
      type: 'summonFromInvocationPool',
      amount: Math.max(1, scriptBlock.target?.count ?? 1),
      maxHp: scriptBlock.pokemon.maxHp,
      summonFilter: scriptBlock.pokemon,
    };
  }

  if (!isPokemonCard(card)) return null;

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
  // Code des cartes : les contraintes de `pokemon` (Pokémon de Base si `stages` n'est pas donné).
  if (rule.summonFilter) {
    const filter = rule.summonFilter.stages?.length
      ? rule.summonFilter
      : { ...rule.summonFilter, stages: ['base' as const] };
    return matchesSummonFilter(card, filter);
  }

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
): GameCard | null {
  // Pokémon du deck, cartes Dresseur « script » qui invoquent, puis Invocations déjà choisies.
  const queue: GameCard[] = [
    ...sources.filter((card) => isPokemonCard(card) || findScriptSummonBlock(card) !== null),
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
  if (rule.summonFilter) {
    const filter = rule.summonFilter;
    const parts = ['Pokémon'];
    if (filter.pokemonTypes?.length) {
      parts.push(filter.pokemonTypes.map((type) => TYPE_LABELS[type] ?? type).join(' ou '));
    }
    if (filter.variants?.length) parts.push(filter.variants.map((variant) => variant.toUpperCase()).join(' ou '));
    parts.push(
      filter.stages?.length
        ? `(${filter.stages.map((stage) => (stage === 'base' ? 'de Base' : stage)).join(' ou ')})`
        : 'de Base'
    );
    if (filter.names?.length) parts.push(`nommé ${filter.names.join(' ou ')}`);
    if (filter.maxHp !== undefined) parts.push(`ayant ${filter.maxHp} PV ou moins`);
    if (filter.minHp !== undefined) parts.push(`ayant au moins ${filter.minHp} PV`);
    return parts.join(' ');
  }

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
