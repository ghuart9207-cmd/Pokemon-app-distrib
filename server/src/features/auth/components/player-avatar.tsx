import { Image, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/features/ui/theme';

import { getAvatarSource } from '../avatars';

type PlayerAvatarProps = {
  avatarUrl: string | null | undefined;
  /** Largeur en px ; la hauteur suit le format d'une carte (5 : 7). */
  width?: number;
};

/** Image de profil au format carte, ou un point d'interrogation si elle est introuvable. */
export function PlayerAvatar({ avatarUrl, width = 48 }: PlayerAvatarProps) {
  const source = getAvatarSource(avatarUrl);
  const size = { width, height: Math.round(width * 1.4) };

  if (!source) {
    return (
      <View style={[styles.placeholder, size]}>
        <Text style={[styles.placeholderText, { fontSize: width * 0.5 }]}>?</Text>
      </View>
    );
  }

  return <Image source={source} style={[styles.image, size]} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 6,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontWeight: '700',
  },
});
