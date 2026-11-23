import { Text, View } from 'react-native';

import { TrainerHandCard } from '@/features/game/components/cards/trainer-hand-card';
import type { TrainerCard } from '@/features/game/types';
import { styles } from './attached-tool-preview.styles';

export function AttachedToolPreview({ card }: { card: TrainerCard }) {
  return (
    <View style={styles.attachedToolPreview}>
      <Text style={styles.attachedToolPreviewTitle}>Outil attaché</Text>
      <TrainerHandCard
        card={card}
        disabled={false}
        isSelected={false}
        onPress={() => {}}
      />
    </View>
  );
}
