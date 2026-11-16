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

/**
 * Pile de défausse : seulement les Énergies, regroupées (« 2 × 💧 Énergie eau »).
 * Les cartes se voient en appuyant sur la pile.
 */
export function DiscardPanel({ player, cards, energies, onToggle }: DiscardPanelProps) {
  // Nombre d'Énergies par type, dans l'ordre où elles apparaissent.
  const energyCounts = energies.reduce<[EnergyType, number][]>((counts, energy) => {
    const existing = counts.find(([type]) => type === energy);
    if (existing) {
      existing[1] += 1;
    } else {
      counts.push([energy, 1]);
    }
    return counts;
  }, []);

  return (
    <Pressable style={styles.discardBox} onPress={() => onToggle(player)}>
      <Text style={styles.discardTitle}>
        🗑️ Défausse J{player} : {cards.length} carte(s) · {energies.length} Énergie(s)
      </Text>
      {energyCounts.map(([energy, count]) => (
        <Text key={`energy-j${player}-${energy}`} style={styles.discardCard}>
          {count} × {getTypeIcon(energy)} Énergie {energy}
        </Text>
      ))}
      {cards.length > 0 && (
        <Text style={styles.discardCard}>Appuie pour voir les cartes</Text>
      )}
    </Pressable>
  );
}
