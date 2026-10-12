import { StyleSheet } from 'react-native';

import { COLORS, FONTS } from '@/features/ui/theme';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  text: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
  },
  strong: {
    fontFamily: FONTS.button,
  },
  turnYou: {
    fontFamily: FONTS.button,
    fontSize: 14,
    color: COLORS.yellow,
  },
  turnOpponent: {
    fontFamily: FONTS.button,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  notice: {
    fontFamily: FONTS.button,
    fontSize: 14,
    color: COLORS.error,
  },
  offline: {
    fontFamily: FONTS.button,
    fontSize: 14,
    color: COLORS.error,
  },
});
