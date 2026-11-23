import { Text, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-context';
import { useOnline } from '@/features/online/online-context';
import { COLORS, FONTS } from '@/features/ui/theme';

/** Liste des joueurs connectés au serveur (menu d'accueil). */
export function OnlinePlayers() {
  const { player } = useAuth();
  const { onlinePlayers, presenceStatus } = useOnline();

  // Pas connecté à un compte : rien à afficher.
  if (!player) return null;

  return (
    <View style={styles.box}>
      <Text style={styles.title}>
        🟢 Joueurs connectés{onlinePlayers ? ` (${onlinePlayers.length})` : ''}
      </Text>

      {onlinePlayers === null ? (
        <Text style={styles.muted}>
          {presenceStatus === 'unsupported'
            ? "Liste indisponible : le serveur n'est pas à jour. Remplace server/realtime.js par la nouvelle version et redémarre le serveur."
            : presenceStatus === 'unreachable'
              ? 'Serveur injoignable, nouvel essai dans quelques secondes…'
              : 'Connexion au serveur…'}
        </Text>
      ) : onlinePlayers.length === 0 ? (
        <Text style={styles.muted}>Personne pour l'instant.</Text>
      ) : (
        onlinePlayers.map((onlinePlayer) => (
          <Text key={onlinePlayer.id} style={styles.line}>
            {onlinePlayer.pseudo}
            {onlinePlayer.id === player.id ? ' (toi)' : ''}
            {onlinePlayer.inGame ? '  🎮 en partie' : ''}
          </Text>
        ))
      )}
    </View>
  );
}

const styles = {
  box: {
    minWidth: 240,
    maxWidth: 360,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 4,
  },
  title: {
    color: COLORS.yellow,
    fontFamily: FONTS.button,
    fontSize: 16,
    marginBottom: 4,
  },
  line: {
    color: COLORS.text,
    fontSize: 15,
  },
  muted: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
};
