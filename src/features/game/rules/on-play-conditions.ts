import type {
  PlayerStatusState,
  PokemonCard,
  PokemonInPlay,
  Player,
  SpecialCondition,
} from '@/features/game/types';
import { filterImmuneConditions } from './script-modifiers';

/**
 * États spéciaux infligés au Pokémon adverse en face quand ce Pokémon est posé.
 * - 'applyConditionsToOpponentOnPlay' : liste `conditions` de la carte ;
 * - 'paralyzeOpponentOnPlay' (Raichu) : Paralysé.
 */
export function getOnPlayConditions(card: PokemonCard): SpecialCondition[] {
  const talent = card.talent;

  if (!talent || talent.type !== 'passive') return [];

  if (talent.effect === 'paralyzeOpponentOnPlay') return ['paralyze'];

  if (talent.effect === 'applyConditionsToOpponentOnPlay') {
    return talent.conditions ?? [];
  }

  return [];
}

/** Applique les états spéciaux au Pokémon ciblé (mêmes durées que les attaques). */
export function applySpecialConditions(
  target: PokemonInPlay,
  conditions: SpecialCondition[],
  sourcePlayer: Player
): PokemonInPlay {
  let updated = { ...target };

  // Code des cartes : immunités contre les états spéciaux.
  for (const condition of filterImmuneConditions(target, conditions, sourcePlayer)) {
    switch (condition) {
      case 'poison':
        updated = { ...updated, poisoned: true, poisonSourcePlayer: sourcePlayer };
        break;
      case 'burn':
        updated = {
          ...updated,
          burned: true,
          burnSourcePlayer: sourcePlayer,
          burnTriggersRemaining: 2,
        };
        break;
      case 'paralyze':
        updated = { ...updated, paralyzed: true, paralysisTurnsRemaining: 1 };
        break;
      case 'confuse':
        updated = { ...updated, confused: true, confusionTurnsRemaining: 2 };
        break;
      case 'sleep':
        // Sans lancer de pièce : se réveille à la fin du prochain tour de son propriétaire.
        updated = {
          ...updated,
          asleep: true,
          sleepSourcePlayer: sourcePlayer,
          sleepEndPlayer: target.owner,
        };
        break;
    }
  }

  return updated;
}

/**
 * États qu'un JOUEUR peut subir : seulement Empoisonné et Brûlé
 * (comme pour les attaques directes). Les autres sont ignorés.
 */
export function getPlayerApplicableConditions(
  conditions: SpecialCondition[]
): SpecialCondition[] {
  return conditions.filter((condition) => condition === 'poison' || condition === 'burn');
}

/** Applique Empoisonné / Brûlé au joueur (mêmes valeurs qu'une attaque directe). */
export function applySpecialConditionsToPlayer(
  status: PlayerStatusState,
  conditions: SpecialCondition[],
  sourcePlayer: Player
): PlayerStatusState {
  let updated = { ...status };

  if (conditions.includes('poison')) {
    updated = { ...updated, poisoned: true, poisonSourcePlayer: sourcePlayer };
  }

  if (conditions.includes('burn')) {
    updated = {
      ...updated,
      burned: true,
      burnSourcePlayer: sourcePlayer,
      burnTriggersRemaining: 2,
    };
  }

  return updated;
}

const CONDITION_LABELS: Record<SpecialCondition, string> = {
  poison: 'Empoisonné ☠️',
  burn: 'Brûlé 🔥',
  paralyze: 'Paralysé ⚡',
  confuse: 'Confus 🌀',
  sleep: 'Endormi 😴',
};

/** Ex : « Empoisonné ☠️ et Brûlé 🔥 ». */
export function formatSpecialConditions(conditions: SpecialCondition[]): string {
  const labels = conditions.map((condition) => CONDITION_LABELS[condition]);

  if (labels.length <= 1) return labels.join('');

  return `${labels.slice(0, -1).join(', ')} et ${labels[labels.length - 1]}`;
}
