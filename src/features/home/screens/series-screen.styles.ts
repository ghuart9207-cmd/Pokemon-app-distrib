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
    gap: 24,
  },
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
  text: {
    fontFamily: FONTS.body,
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    maxWidth: 420,
  },
  buttons: {
    alignItems: 'stretch',
    gap: 18,
  },
  seriesButton: {
    minWidth: 300,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    backgroundColor: COLORS.red,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.redDark,
  },
  seriesButtonPressed: {
    marginTop: 4,
    borderBottomWidth: 2,
    opacity: 0.95,
  },
  seriesText: {
    fontFamily: FONTS.button,
    fontSize: 24,
    letterSpacing: 1,
    color: COLORS.text,
    textAlign: 'center',
  },
  seriesHint: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.8,
    marginTop: 4,
  },
  link: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.yellow,
  },
});
