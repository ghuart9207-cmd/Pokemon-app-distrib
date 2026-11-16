import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/auth-context';
import type { CardSeries } from '@/features/game/types';

import {
  getNextDeckName,
  loadDecks,
  saveDecks,
  subscribeToDecks,
  type SavedDeck,
} from './deck-storage';

/** Contenu d'un deck (sans nom), tel qu'il sort de l'écran de choix des cartes. */
export type DeckContent = {
  cardIds: string[];
  invocationCardIds: string[];
  summonChoiceIds: Record<string, string[]>;
};

/** Les decks du compte connecté, et de quoi les modifier. */
export function useDecks() {
  const { player } = useAuth();
  const playerId = player?.id ?? null;

  const [decks, setDecks] = useState<SavedDeck[]>(() =>
    playerId === null ? [] : loadDecks(playerId)
  );

  useEffect(() => {
    if (playerId === null) {
      setDecks([]);
      return;
    }

    setDecks(loadDecks(playerId));
    return subscribeToDecks(() => setDecks(loadDecks(playerId)));
  }, [playerId]);

  function write(next: SavedDeck[]) {
    if (playerId === null) return;
    saveDecks(playerId, next);
  }

  /** Nouveau deck (« Deck N ») : renvoie son id. */
  function addDeck(series: CardSeries, content: DeckContent): string | null {
    if (playerId === null) return null;

    const current = loadDecks(playerId);
    const deck: SavedDeck = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: getNextDeckName(current),
      series,
      ...content,
      updatedAt: Date.now(),
    };

    write([...current, deck]);
    return deck.id;
  }

  function updateDeckContent(deckId: string, content: DeckContent) {
    if (playerId === null) return;
    write(
      loadDecks(playerId).map((deck) =>
        deck.id === deckId ? { ...deck, ...content, updatedAt: Date.now() } : deck
      )
    );
  }

  function renameDeck(deckId: string, name: string) {
    if (playerId === null) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    write(
      loadDecks(playerId).map((deck) =>
        deck.id === deckId ? { ...deck, name: trimmed.slice(0, 30) } : deck
      )
    );
  }

  function deleteDeck(deckId: string) {
    if (playerId === null) return;
    write(loadDecks(playerId).filter((deck) => deck.id !== deckId));
  }

  return {
    isLoggedIn: playerId !== null,
    decks,
    addDeck,
    updateDeckContent,
    renameDeck,
    deleteDeck,
  };
}
