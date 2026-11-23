import { Image, Pressable, Text, View } from 'react-native';

import type { TrainerCard } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import { styles } from './trainer-hand-card.styles';

type TrainerHandCardProps = {
  card: TrainerCard;
  disabled: boolean;
  isSelected: boolean;
  onPress: () => void;
};

export function TrainerHandCard({
  card,
  disabled,
  isSelected,
  onPress,
}: TrainerHandCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.trainerCard,
        disabled && sharedStyles.disabledCard,
        isSelected && styles.selectedCard,
      ]}
    >
      <View style={styles.trainerTopHeader}>
        <Text style={styles.trainerHeaderLeft}>DRESSEUR</Text>
        <Text style={styles.trainerHeaderSeparator}>|</Text>
        <Text style={styles.trainerHeaderRight}>
          {card.category === 'objet' ? 'Objet' : 'Supporter'}
        </Text>
      </View>

      <View style={styles.trainerNameBar}>
        <Text style={styles.trainerCardName} numberOfLines={1}>
          {card.name}
        </Text>
      </View>

      <View style={styles.trainerArtworkFrame}>
        {card.artwork ? (
          <Image
            source={card.artwork}
            style={styles.trainerArtworkImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.trainerArtworkPlaceholder}>{card.name}</Text>
        )}
      </View>

      {card.subtype === 'outil' && (
        <View style={styles.trainerToolBar}>
          <Text style={styles.trainerToolText}>Outil Pokémon</Text>
        </View>
      )}

      <View style={styles.trainerDescriptionBox}>
        <Text style={styles.trainerDescription}>{card.description}</Text>
      </View>
    </Pressable>
  );
}
