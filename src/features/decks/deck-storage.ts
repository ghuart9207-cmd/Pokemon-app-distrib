import { Platform } from 'react-native';

import type { CardSeries } from '@/features/game/types';

/**
 * Deck enregistré : les cartes choisies, et les Invocations choisies
 * (Fan Club, Pokémon qui invoquent), comme à la préparation d'une partie.
 */
export type SavedDeck = {
  id: string;
  name: string;
  series: CardSeries;
  cardIds: string[];
  invocationCardIds: string[];
  // Pokémon qui invoque -> ids des Pokémon choisis.
  summonChoiceIds: Record<string, string[]>;
  updatedAt: number;
};

const STORAGE_PREFIX = 'pokemon-version-vincent-decks-';

// Sur mobile, les decks ne sont gardés qu'en mémoire (comme le jeton de connexion).
const memoryDecks: Record<string, SavedDeck[]> = {};

/** Decks enregistrés sur cet appareil pour ce compte. */
export function loadDecks(playerId: number): SavedDeck[] {
  const key = `${STORAGE_PREFIX}${playerId}`;

  if (Platform.OS === 'web') {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as SavedDeck[]) : [];
    } catch {
      return memoryDecks[key] ?? [];
    }
  }

  return memoryDecks[key] ?? [];
}

/** Enregistre tous les decks de ce compte sur cet appareil. */
export function saveDecks(playerId: number, decks: SavedDeck[]): void {
  const key = `${STORAGE_PREFIX}${playerId}`;
  memoryDecks[key] = decks;

  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(key, JSON.stringify(decks));
    } catch {
      // stockage indisponible (navigation privée…) : gardé en mémoire seulement
    }
  }

  for (const listener of listeners) listener();
}

// Prévient les écrans ouverts quand les decks changent.
const listeners = new Set<() => void>();

export function subscribeToDecks(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Prochain nom libre : « Deck 1 », « Deck 2 »… */
export function getNextDeckName(decks: SavedDeck[]): string {
  const numbers = decks
    .map((deck) => /^Deck (\d+)$/.exec(deck.name)?.[1])
    .filter((value): value is string => value !== undefined)
    .map(Number);

  let next = decks.length + 1;
  while (numbers.includes(next)) next += 1;

  return `Deck ${next}`;
}
