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
    paddingBottom: 24,
    // un peu moins d'espace : place pour le bouton Decks et la liste des joueurs
    gap: 28,
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
  // Joueurs connectés à gauche (grand écran)
  sidePlayers: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    gap: 12,
  },
  buttons: {
    alignItems: 'center',
    gap: 18,
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
  onlineButton: {
    minWidth: 240,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: COLORS.yellow,
  },
  onlineButtonPressed: {
    opacity: 0.7,
  },
  onlineText: {
    fontFamily: FONTS.button,
    fontSize: 22,
    letterSpacing: 1,
    color: COLORS.yellow,
  },
});
