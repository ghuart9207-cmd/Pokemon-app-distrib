import { useGame } from '@/features/game/hooks/use-game';

import { GameView } from './game-view';

/** Partie locale : les deux joueurs partagent le même écran. */
export default function GameScreen() {
  const game = useGame();

  return <GameView game={game} />;
}
