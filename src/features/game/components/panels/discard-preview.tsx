import { Pressable, ScrollView, Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import { TrainerHandCard } from '@/features/game/components/cards/trainer-hand-card';
import { isPokemonCard } from '@/features/game/rules';
import type { GameCard, Player } from '@/features/game/types';
import { styles } from './discard-preview.styles';

type DiscardPreviewProps = {
  player: Player;
  cards: GameCard[];
  onClose: () => void;
};

export function DiscardPreview({ player, cards, onClose }: DiscardPreviewProps) {
  return (
    <View style={styles.discardPreviewOverlay}>
      <View style={styles.discardPreviewHeader}>
        <Text style={styles.discardPreviewTitle}>🗑️ Défausse J{player}</Text>
        <Pressable onPress={onClose}>
          <Text style={styles.discardPreviewClose}>✕</Text>
        </Pressable>
      </View>

      {cards.length === 0 ? (
        <Text style={styles.discardPreviewEmpty}>Aucune carte</Text>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          style={styles.discardPreviewScroll}
        >
          <View style={styles.discardPreviewColumns}>
            {Array.from({ length: Math.ceil(cards.length / 2) }).map((_, columnIndex) => (
              <View
                key={`discard-column-${columnIndex}`}
                style={styles.discardPreviewColumn}
              >
                {[cards[columnIndex * 2], cards[columnIndex * 2 + 1]].map(
                  (card, rowIndex) =>
                    card ? (
                      <View
                        key={`${card.id}-${columnIndex}-${rowIndex}`}
                        style={styles.discardPreviewCard}
                      >
                        {isPokemonCard(card) ? (
                          <View style={styles.discardPreviewPokemonSize}>
                            <PokemonHandCard card={card} />
                          </View>
                        ) : (
                          <TrainerHandCard
                            card={card}
                            disabled={false}
                            isSelected={false}
                            onPress={() => {}}
                          />
                        )}
                      </View>
                    ) : null
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
