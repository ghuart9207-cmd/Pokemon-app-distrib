import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { useAuth } from '@/features/auth/auth-context';
import { COLORS, FONTS } from '@/features/ui/theme';

/** Panneau « Journal de combat » (menu d'accueil, sous les joueurs connectés). */
export function MatchHistoryButton() {
  const router = useRouter();
  const { player } = useAuth();

  // Pas connecté à un compte : pas de journal.
  if (!player) return null;

  return (
    <Pressable
      style={({ pressed }: { pressed: boolean }) => [styles.box, pressed && styles.pressed]}
      onPress={() => router.push('/journal')}
      accessibilityRole="button"
    >
      <Text style={styles.title}>📜 Journal de combat</Text>
      <Text style={styles.text}>Tes derniers combats en ligne</Text>
    </Pressable>
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
  pressed: { opacity: 0.8 },
  title: { color: COLORS.yellow, fontFamily: FONTS.button, fontSize: 16 },
  text: { color: COLORS.textMuted, fontSize: 14 },
};
