import { Pressable, Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import type { PendingInvocationPlacement } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type InvocationPlacementPromptProps = {
  pending: PendingInvocationPlacement;
  onSelectIndex: (index: number) => void;
};

export function InvocationPlacementPrompt({
  pending,
  onSelectIndex,
}: InvocationPlacementPromptProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>✨ Invocation Duo</Text>
      <Text style={sharedStyles.actionInfo}>
        Choisis une Invocation, puis clique sur une case vide de ta ligne.
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {pending.cards.map((card, index) => (
          <Pressable
            key={`pending-invocation-${card.id}-${index}`}
            onPress={() => onSelectIndex(index)}
            style={sharedStyles.handPokemonPressable}
          >
            <PokemonHandCard card={card} />
            <Text style={sharedStyles.actionInfo}>
              {pending.selectedIndex === index ? '✅ À poser' : 'Choisir'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
