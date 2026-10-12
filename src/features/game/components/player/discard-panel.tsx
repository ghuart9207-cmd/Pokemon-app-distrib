import { Pressable, Text } from 'react-native';

import type { EnergyType, GameCard, Player } from '@/features/game/types';
import { getTypeIcon } from '@/features/game/utils/card-labels';
import { styles } from './discard-panel.styles';

type DiscardPanelProps = {
  player: Player;
  cards: GameCard[];
  energies: EnergyType[];
  onToggle: (player: Player) => void;
};

export function DiscardPanel({ player, cards, energies, onToggle }: DiscardPanelProps) {
  return (
    <Pressable style={styles.discardBox} onPress={() => onToggle(player)}>
      <Text style={styles.discardTitle}>
        🗑️ Défausse J{player} : {cards.length + energies.length}
      </Text>
      {cards.map((card, index) => (
        <Text key={`${card.id}-${index}`} style={styles.discardCard}>
          {card.name}
        </Text>
      ))}
      {energies.map((energy, index) => (
        <Text key={`energy-j${player}-${index}`} style={styles.discardCard}>
          {getTypeIcon(energy)} Énergie
        </Text>
      ))}
    </Pressable>
  );
}
