import { useLocalSearchParams } from 'expo-router';

import { toCardSeries } from '@/features/game/data';
import { useGame } from '@/features/game/hooks/use-game';

import { GameView } from './game-view';

/**
 * Partie locale : les deux joueurs partagent le même écran.
 * La série de cartes vient de l'écran de choix (paramètre `serie`).
 */
export default function GameScreen() {
  const { serie } = useLocalSearchParams<{ serie?: string }>();
  const game = useGame(toCardSeries(serie));

  return <GameView game={game} />;
}
