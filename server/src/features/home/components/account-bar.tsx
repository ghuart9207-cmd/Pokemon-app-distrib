import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-context';
import { PlayerAvatar } from '@/features/auth/components/player-avatar';

import { styles } from './account-bar.styles';

/** Barre en haut de l'accueil : profil du joueur connecté (infos venant de la base) ou bouton Se connecter. */
export function AccountBar() {
  const router = useRouter();
  const { player, isLoading, logout } = useAuth();

  if (isLoading) {
    return <View style={styles.bar} />;
  }

  if (!player) {
    return (
      <View style={styles.bar}>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push('/connexion')}
          accessibilityRole="button"
        >
          <Text style={styles.loginText}>Se connecter</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <View style={styles.profile}>
        <View style={styles.profileInfo}>
          <Text style={styles.pseudo}>{player.pseudo}</Text>
          <Text style={styles.stats}>
            {player.wins} V · {player.losses} D · ELO {player.elo}
          </Text>
          <Pressable onPress={logout} accessibilityRole="button">
            <Text style={styles.link}>Se déconnecter</Text>
          </Pressable>
        </View>

        <PlayerAvatar avatarUrl={player.avatarUrl} width={44} />
      </View>
    </View>
  );
}
