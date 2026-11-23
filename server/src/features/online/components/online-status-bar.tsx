import { Text, View } from 'react-native';

import { useOnline } from '../online-context';
import { styles } from './online-status-bar.styles';

type OnlineStatusBarProps = {
  /** Vrai quand c'est à moi d'agir. */
  canAct: boolean;
  /** Message temporaire (action refusée, synchronisation…). */
  notice: string | null;
};

/** Bandeau au-dessus de la partie : qui est qui, à qui de jouer, état de la connexion. */
export function OnlineStatusBar({ canAct, notice }: OnlineStatusBarProps) {
  const { room, status } = useOnline();

  if (!room) return null;

  const me = room.players[room.you - 1];
  const opponent = room.players[room.you === 1 ? 1 : 0];
  const isConnected = status === 'open';

  return (
    <View style={styles.bar}>
      <Text style={styles.text}>
        Toi : <Text style={styles.strong}>{me?.pseudo}</Text> (Joueur {room.you}) ·
        Adversaire : <Text style={styles.strong}>{opponent ? opponent.pseudo : '—'}</Text>
        {opponent && !opponent.connected ? ' (déconnecté)' : ''}
      </Text>

      {!isConnected ? (
        <Text style={styles.offline}>Reconnexion…</Text>
      ) : notice ? (
        <Text style={styles.notice}>{notice}</Text>
      ) : (
        <Text style={canAct ? styles.turnYou : styles.turnOpponent}>
          {canAct ? 'À toi de jouer' : "Tour de l'adversaire"}
        </Text>
      )}

      <Text style={styles.text}>
        Code : <Text style={styles.strong}>{room.code}</Text>
      </Text>
    </View>
  );
}
