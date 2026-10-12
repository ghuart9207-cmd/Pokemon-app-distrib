import { StyleSheet } from 'react-native';

import { COLORS, FONTS } from '@/features/ui/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 48,
  },
  title: {
    maxWidth: 900,
    textAlign: 'center',
    fontFamily: FONTS.title,
    color: COLORS.yellow,
    letterSpacing: 2,
    // ombre pleine décalée : donne l'effet « logo » bleu derrière les lettres
    textShadowColor: COLORS.border,
    textShadowOffset: { width: 4, height: 5 },
    textShadowRadius: 0,
  },
  playButton: {
    minWidth: 240,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: 18,
    backgroundColor: COLORS.red,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.redDark,
  },
  playButtonPressed: {
    marginTop: 4,
    borderBottomWidth: 2,
    opacity: 0.95,
  },
  playText: {
    fontFamily: FONTS.button,
    fontSize: 32,
    letterSpacing: 1,
    color: COLORS.text,
  },
});
