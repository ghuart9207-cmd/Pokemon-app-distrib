import { useRouter } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth/auth-context';

import { AccountBar } from '../components/account-bar';
import { styles } from './home-screen.styles';

const TITLE_MIN_SIZE = 44;
const TITLE_MAX_SIZE = 96;

/** Accueil : le titre du jeu, le bouton Jouer et l'état du compte en haut. */
export default function HomeScreen() {
  const router = useRouter();
  const { player } = useAuth();
  const { width } = useWindowDimensions();

  // le titre grandit avec l'écran, dans des limites raisonnables
  const titleSize = Math.round(
    Math.min(TITLE_MAX_SIZE, Math.max(TITLE_MIN_SIZE, width * 0.09))
  );

  function handlePlay() {
    if (player) {
      router.push('/jeu');
    } else {
      // pas connecté : on passe par la connexion, puis on revient lancer le jeu
      router.push({ pathname: '/connexion', params: { next: 'jeu' } });
    }
  }

  function handlePlayOnline() {
    if (player) {
      router.push('/en-ligne');
    } else {
      router.push({ pathname: '/connexion', params: { next: 'en-ligne' } });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AccountBar />

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.1) },
          ]}
          accessibilityRole="header"
        >
          Pokemon Version Vincent
        </Text>

        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [
              styles.playButton,
              pressed && styles.playButtonPressed,
            ]}
            onPress={handlePlay}
            accessibilityRole="button"
          >
            <Text style={styles.playText}>Jouer</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.onlineButton,
              pressed && styles.onlineButtonPressed,
            ]}
            onPress={handlePlayOnline}
            accessibilityRole="button"
          >
            <Text style={styles.onlineText}>Jouer en ligne</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
