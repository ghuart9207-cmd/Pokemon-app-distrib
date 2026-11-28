import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '@/features/ui/theme';

type Mode = {
  id: 'classee' | 'amical';
  emoji: string;
  title: string;
  text: string;
};

const MODES: Mode[] = [
  {
    id: 'classee',
    emoji: '🏆',
    title: 'Classée',
    text: "L'ELO est en jeu : tu en gagnes en cas de victoire et tu en perds en cas de défaite.",
  },
  {
    id: 'amical',
    emoji: '🤝',
    title: 'Amicale',
    text: "Pour s'entraîner entre amis : ton ELO ne change pas.",
  },
];

/** « Jouer en ligne » : choix entre partie classée et partie amicale. */
export default function OnlineModeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.panels}>
          {MODES.map((mode) => (
            <Pressable
              key={mode.id}
              style={({ pressed }: { pressed: boolean }) => [styles.panel, pressed && styles.panelPressed]}
              onPress={() => router.push({ pathname: '/serie', params: { mode: 'en-ligne', type: mode.id } })}
              accessibilityRole="button"
            >
              <Text style={styles.emoji}>{mode.emoji}</Text>
              <Text style={styles.panelTitle}>{mode.title}</Text>
              <Text style={styles.panelText}>{mode.text}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  panels: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24 },
  panel: {
    width: 260,
    minHeight: 220,
    padding: 20,
    gap: 10,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.red,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.redDark,
  },
  panelPressed: { marginTop: 4, borderBottomWidth: 2, opacity: 0.95 },
  emoji: { fontSize: 44 },
  panelTitle: { fontFamily: FONTS.button, fontSize: 26, color: COLORS.text },
  panelText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.text, opacity: 0.9, textAlign: 'center' },
});
