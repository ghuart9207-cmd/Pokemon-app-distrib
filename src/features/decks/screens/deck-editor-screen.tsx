import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { toCardSeries } from '@/features/game/data';
import { useGame } from '@/features/game/hooks/use-game';
import { GameView } from '@/features/game/screens/game-view';

import { useDecks } from '../use-decks';

/**
 * Création ou modification d'un deck : le même écran que le choix des cartes
 * d'une partie (avec les Invocations), mais « Valider » enregistre le deck.
 */
export default function DeckEditorScreen() {
  const router = useRouter();
  const { serie, deckId } = useLocalSearchParams<{ serie?: string; deckId?: string }>();
  const series = toCardSeries(serie);
  const game = useGame(series);
  const { decks, addDeck, updateDeckContent } = useDecks();

  const editedDeck = deckId ? decks.find((deck) => deck.id === deckId) : undefined;
  const loadedRef = useRef(false);

  // Modification : on coche les cartes du deck une seule fois, à l'ouverture.
  useEffect(() => {
    if (loadedRef.current || !editedDeck) return;
    loadedRef.current = true;
    game.loadSetupDeck(editedDeck.cardIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedDeck]);

  // « Valider » (puis les Invocations) : on enregistre au lieu de lancer une partie.
  useEffect(() => {
    game.setOnlineSetupSubmit((payload) => {
      const content = {
        cardIds: payload.cardIds,
        invocationCardIds: payload.invocationCardIds,
        summonChoiceIds: payload.summonChoiceIds,
      };

      if (editedDeck) {
        updateDeckContent(editedDeck.id, content);
      } else {
        addDeck(series, content);
      }

      if (router.canGoBack()) router.back();
      else router.replace('/decks');
    });
  });

  useEffect(() => {
    return () => game.setOnlineSetupSubmit(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameView
      game={game}
      deckEditorTitle={editedDeck ? `Modifier : ${editedDeck.name}` : 'Nouveau deck'}
    />
  );
}
