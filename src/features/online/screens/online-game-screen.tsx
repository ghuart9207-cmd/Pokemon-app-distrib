import { View } from 'react-native';

import { useGame } from '@/features/game/hooks/use-game';
import { GameView } from '@/features/game/screens/game-view';
import { COLORS } from '@/features/ui/theme';

import { OnlineStatusBar } from '../components/online-status-bar';
import { useOnline } from '../online-context';
import { useOnlineGame } from '../use-online-game';

/**
 * Partie en ligne : le même jeu que la partie locale, dont les actions passent par le serveur.
 * Les deux joueurs voient tout (mains comprises) et peuvent inspecter les cartes de l'adversaire.
 */
export default function OnlineGameScreen() {
  const { room } = useOnline();
  // Même série de cartes pour les deux joueurs (celle du salon).
  const rawGame = useGame(room?.series);
  const { game, notice, canAct } = useOnlineGame(rawGame, room ? room.you : 1);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <OnlineStatusBar canAct={canAct} notice={notice} />
      <View style={{ flex: 1 }}>
        <GameView game={game} />
      </View>
    </View>
  );
}
