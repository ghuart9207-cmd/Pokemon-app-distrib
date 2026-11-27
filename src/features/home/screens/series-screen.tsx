import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CARD_SERIES_LIST } from '@/features/game/data';
import type { CardSeries } from '@/features/game/types';

import { styles } from './series-screen.styles';

/**
 * Choix de la série de cartes, après « Jouer » ou « Jouer en ligne ».
 * - Partie locale : les deux joueurs choisiront leurs cartes dans cette série.
 * - En ligne : la série est envoyée au salon ; l'adversaire doit choisir la même.
 */
export default function SeriesScreen() {
  const router = useRouter();
  const { mode, type } = useLocalSearchParams<{ mode?: string; type?: string }>();
  const isOnline = mode === 'en-ligne';
  // Création d'un deck : la série choisie ouvre l'écran de composition du deck.
  const isDeck = mode === 'deck';

  function handleChoose(series: CardSeries) {
    if (isDeck) {
      // replace : après l'enregistrement, « retour » ramène à la liste des decks
      router.replace({ pathname: '/deck-editor', params: { serie: series } });
      return;
    }

    router.push({
      pathname: isOnline ? '/en-ligne' : '/jeu',
      // en ligne : « classee » ou « amical » (choisi juste avant)
      params: isOnline ? { serie: series, mode: type === 'amical' ? 'amical' : 'classee' } : { serie: series },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">
          {isDeck ? 'Nouveau deck' : isOnline ? 'Jouer en ligne' : 'Jouer'}
        </Text>
        <Text style={styles.text}>Choisis la série de cartes</Text>

        <View style={styles.buttons}>
          {CARD_SERIES_LIST.map((series) => (
            <Pressable
              key={series.id}
              style={({ pressed }) => [
                styles.seriesButton,
                pressed && styles.seriesButtonPressed,
              ]}
              onPress={() => handleChoose(series.id)}
              accessibilityRole="button"
            >
              <Text style={styles.seriesText}>{series.label}</Text>
              {series.pokemon.length === 0 && (
                <Text style={styles.seriesHint}>Cartes bientôt disponibles</Text>
              )}
            </Pressable>
          ))}
        </View>

        {isOnline && (
          <Text style={styles.text}>
            Ton adversaire devra choisir la même série pour rejoindre ta partie.
          </Text>
        )}

        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.link}>← Retour</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
