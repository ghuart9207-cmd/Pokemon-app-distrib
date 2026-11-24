import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { toCardSeries } from '@/features/game/data';
import { useGame } from '@/features/game/hooks/use-game';
import { GameView } from '@/features/game/screens/game-view';
import { COLORS } from '@/features/ui/theme';

import { AUTONOMY_PLAYER_DECK, BOT_DECK } from './free-play-decks';
import { useFreePlay } from './use-free-play';

/** Étape 3 : messages affichés avant le combat (bouton OK entre chaque). */
const AUTONOMY_INTRO = [
  'Il y a des règles en fonction de si tu joues en 1er ou en second.',
  "Si tu joues en 1er, tu ne peux jouer que des Pokémon de Base pendant ton 1er tour, que des Pokémon de Base ou de Niveau 1 pendant ton 2e tour, et ce que tu veux à partir de ton 3e tour.",
  'Tes Pokémon ne peuvent pas non plus battre en retraite pendant tes 2 premiers tours.',
  'Si tu joues en second, tu ne peux jouer que des Pokémon de Base ou de Niveau 1 pendant ton 1er tour.',
  "Voilà, c'est tout ! Je te laisse combattre en autonomie contre ce super bot.",
];

/** Étape 3 : test en autonomie (decks du didacticiel, vraies règles, l'adversaire joue tout seul). */
export function AutonomyScreen() {
  const rawGame = useGame('tcg-pocket');
  const { game, panel } = useFreePlay(rawGame, {
    kind: 'autonomie',
    playerDeck: AUTONOMY_PLAYER_DECK,
    opponentDeck: BOT_DECK,
    intro: AUTONOMY_INTRO,
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GameView game={game} tutorial={panel} />
    </View>
  );
}

/** Étape 4 : entraînement (série et deck au choix, l'ordinateur garde le deck de l'étape 3). */
export function TrainingScreen() {
  const { serie } = useLocalSearchParams<{ serie?: string }>();
  const rawGame = useGame(toCardSeries(serie));
  // L'ordinateur garde le même deck qu'au test en autonomie.
  const { game } = useFreePlay(rawGame, { kind: 'entrainement', opponentDeck: BOT_DECK });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GameView game={game} />
    </View>
  );
}
