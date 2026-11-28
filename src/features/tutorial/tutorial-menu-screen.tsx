import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CARD_SERIES_LIST } from '@/features/game/data';
import type { CardSeries } from '@/features/game/types';
import { COLORS, FONTS } from '@/features/ui/theme';

type Panel = {
  step: number;
  title: string;
  text: string;
  route: '/didacticiel-base' | '/didacticiel-approfondissement' | '/didacticiel-autonomie' | null;
};

const PANELS: Panel[] = [
  { step: 1, title: 'Base du jeu', text: 'Apprends à poser tes Pokémon, attacher des Énergies et attaquer.', route: '/didacticiel-base' },
  { step: 2, title: 'Approfondissement', text: 'Découvre les règles plus avancées.', route: '/didacticiel-approfondissement' },
  { step: 3, title: 'Test en autonomie', text: "L'adversaire joue tout seul : à toi de jouer comme tu veux !", route: '/didacticiel-autonomie' },
  { step: 4, title: 'Entraînement', text: 'Choisis ta série et ton deck, puis affronte l’ordinateur.', route: null },
];

/** Menu du didacticiel : 4 panneaux. */
export default function TutorialMenuScreen() {
  const router = useRouter();
  const [choosingSeries, setChoosingSeries] = useState(false);

  function startTraining(series: CardSeries) {
    router.push({ pathname: '/didacticiel-entrainement', params: { serie: series } });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">
          Didacticiel
        </Text>

        <View style={styles.panels}>
          {PANELS.map((panel) => (
            // Les boutons de série sont à côté du panneau, pas dedans
            // (un bouton dans un bouton fait planter la version web).
            <View key={panel.step} style={styles.panelBox}>
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [styles.panel, pressed && styles.panelPressed]}
                onPress={() => (panel.route ? router.push(panel.route) : setChoosingSeries(!choosingSeries))}
                accessibilityRole="button"
              >
                <Text style={styles.stepLabel}>Étape {panel.step}</Text>
                <Text style={styles.panelTitle}>{panel.title}</Text>
                <Text style={styles.panelText}>{panel.text}</Text>
              </Pressable>

              {panel.route === null && choosingSeries && (
                <View style={styles.seriesRow}>
                  {CARD_SERIES_LIST.map((series) => (
                    <Pressable
                      key={series.id}
                      style={({ pressed }: { pressed: boolean }) => [styles.seriesButton, pressed && styles.panelPressed]}
                      onPress={() => startTraining(series.id)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.seriesText}>{series.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.link}>← Retour</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  heading: {
    fontFamily: FONTS.title,
    fontSize: 48,
    color: COLORS.yellow,
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: COLORS.border,
    textShadowOffset: { width: 3, height: 4 },
    textShadowRadius: 0,
  },
  panels: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18, maxWidth: 1000 },
  panelBox: { width: 220, gap: 8 },
  panel: {
    width: 220,
    minHeight: 180,
    padding: 16,
    gap: 8,
    borderRadius: 18,
    backgroundColor: COLORS.red,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.redDark,
  },
  panelPressed: { marginTop: 4, borderBottomWidth: 2, opacity: 0.95 },
  stepLabel: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.yellow },
  panelTitle: { fontFamily: FONTS.button, fontSize: 22, color: COLORS.text },
  panelText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.text, opacity: 0.9 },
  seriesRow: { gap: 8 },
  seriesButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.redDark,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  seriesText: { fontFamily: FONTS.button, fontSize: 16, color: COLORS.text },
  link: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.yellow },
});
