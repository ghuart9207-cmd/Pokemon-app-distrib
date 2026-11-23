import { StyleSheet } from 'react-native';

import { COLORS, FONTS } from '@/features/ui/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    gap: 14,
    padding: 22,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  heading: {
    textAlign: 'center',
    fontFamily: FONTS.title,
    fontSize: 38,
    letterSpacing: 1,
    color: COLORS.yellow,
  },
  text: {
    textAlign: 'center',
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.textMuted,
  },
  label: {
    fontFamily: FONTS.button,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  code: {
    textAlign: 'center',
    fontFamily: FONTS.title,
    fontSize: 64,
    letterSpacing: 8,
    color: COLORS.text,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    fontFamily: FONTS.button,
    fontSize: 24,
    letterSpacing: 6,
    textAlign: 'center',
    color: COLORS.text,
  },
  separator: {
    textAlign: 'center',
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  error: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.red,
    borderBottomWidth: 5,
    borderBottomColor: COLORS.redDark,
  },
  primaryText: {
    fontFamily: FONTS.button,
    fontSize: 20,
    color: COLORS.text,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.yellow,
  },
  seriesSelected: {
    backgroundColor: 'rgba(255, 203, 5, 0.18)',
    borderWidth: 3,
  },
  secondaryText: {
    fontFamily: FONTS.button,
    fontSize: 17,
    color: COLORS.yellow,
  },
  disabled: {
    opacity: 0.6,
  },
  link: {
    textAlign: 'center',
    fontFamily: FONTS.button,
    fontSize: 15,
    color: COLORS.yellow,
    textDecorationLine: 'underline',
  },
});
