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
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.border,
  },
  tabText: {
    fontFamily: FONTS.button,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  label: {
    fontFamily: FONTS.button,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    fontFamily: FONTS.body,
    fontSize: 17,
    color: COLORS.text,
  },
  avatarList: {
    gap: 8,
    paddingVertical: 4,
  },
  avatarOption: {
    padding: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: COLORS.yellow,
  },
  error: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
  },
  submitButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.red,
    borderBottomWidth: 5,
    borderBottomColor: COLORS.redDark,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontFamily: FONTS.button,
    fontSize: 20,
    color: COLORS.text,
  },
  secondaryActions: {
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  link: {
    fontFamily: FONTS.button,
    fontSize: 15,
    color: COLORS.yellow,
    textDecorationLine: 'underline',
  },
});
