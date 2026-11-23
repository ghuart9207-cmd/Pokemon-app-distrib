import { StyleSheet } from 'react-native';

import { COLORS, FONTS } from '@/features/ui/theme';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 76,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileInfo: {
    alignItems: 'flex-end',
  },
  pseudo: {
    fontFamily: FONTS.button,
    fontSize: 18,
    color: COLORS.text,
  },
  stats: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  link: {
    fontFamily: FONTS.button,
    fontSize: 14,
    color: COLORS.yellow,
    textDecorationLine: 'underline',
  },
  loginButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.yellow,
  },
  loginText: {
    fontFamily: FONTS.button,
    fontSize: 16,
    color: COLORS.yellow,
  },
});
