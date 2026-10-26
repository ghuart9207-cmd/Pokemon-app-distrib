import type { CardSeries, PokemonCard, TrainerCard } from '@/features/game/types';

import { ALL_POKEMON_CARDS, ALL_TRAINER_CARDS } from './all-cards';
import {
  GARDIENS_ASCENDANTS_POKEMON_CARDS,
  GARDIENS_ASCENDANTS_TRAINER_CARDS,
} from './gardiens-ascendants';
import { POCKET_POKEMON_CARDS, POCKET_TRAINER_CARDS } from './tcg-pocket';

/** Une extension = un panneau repliable dans le choix du deck. */
export type CardExtensionInfo = {
  id: string;
  label: string;
  pokemon: PokemonCard[];
  trainers: TrainerCard[];
};

export type CardSeriesInfo = {
  id: CardSeries;
  label: string;
  /** Extensions de la série, dans l'ordre d'affichage. */
  extensions: CardExtensionInfo[];
  /** Toutes les cartes de la série (toutes extensions réunies). */
  pokemon: PokemonCard[];
  trainers: TrainerCard[];
};

function createSeries(
  id: CardSeries,
  label: string,
  extensions: CardExtensionInfo[]
): CardSeriesInfo {
  return {
    id,
    label,
    extensions,
    pokemon: extensions.flatMap((extension) => extension.pokemon),
    trainers: extensions.flatMap((extension) => extension.trainers),
  };
}

/** Les séries de cartes. Une partie n'utilise que les cartes d'une seule série. */
export const CARD_SERIES: Record<CardSeries, CardSeriesInfo> = {
  'soleil-lune': createSeries('soleil-lune', 'Pokémon Soleil et Lune', [
    {
      // Les cartes déjà codées (dossiers `pokemon/` et `trainers/`).
      id: 'ombre-ardente',
      label: 'Ombre Ardente',
      pokemon: ALL_POKEMON_CARDS,
      trainers: ALL_TRAINER_CARDS,
    },
    {
      id: 'gardiens-ascendants',
      label: 'Gardiens Ascendants',
      pokemon: GARDIENS_ASCENDANTS_POKEMON_CARDS,
      trainers: GARDIENS_ASCENDANTS_TRAINER_CARDS,
    },
  ]),
  'tcg-pocket': createSeries('tcg-pocket', 'Pokémon TCG Pocket', [
    {
      id: 'tcg-pocket',
      label: 'Pokémon TCG Pocket',
      pokemon: POCKET_POKEMON_CARDS,
      trainers: POCKET_TRAINER_CARDS,
    },
  ]),
};

export const DEFAULT_CARD_SERIES: CardSeries = 'soleil-lune';

export const CARD_SERIES_LIST: CardSeriesInfo[] = [
  CARD_SERIES['soleil-lune'],
  CARD_SERIES['tcg-pocket'],
];

/** Transforme une valeur reçue (paramètre d'URL, serveur) en série valide. */
export function toCardSeries(value: unknown): CardSeries {
  return value === 'tcg-pocket' || value === 'soleil-lune'
    ? value
    : DEFAULT_CARD_SERIES;
}

/** Toutes les cartes connues, toutes séries confondues (recherche par id). */
export const ALL_SERIES_POKEMON_CARDS: PokemonCard[] = CARD_SERIES_LIST.flatMap(
  (series) => series.pokemon
);

export const ALL_SERIES_TRAINER_CARDS: TrainerCard[] = CARD_SERIES_LIST.flatMap(
  (series) => series.trainers
);
