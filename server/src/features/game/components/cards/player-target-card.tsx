import { Pressable, Text } from 'react-native';

import type { Player, PlayerStatusState } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import { styles } from './player-target-card.styles';

export function PlayerTargetCard({
  player,
  damage,
  status,
  onPress,
  selectable,
}: {
  player: Player;
  damage: number;
  status: PlayerStatusState;
  onPress: () => void;
  selectable: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        sharedStyles.handPokemonPressable,
        styles.playerTargetCard,
        selectable && styles.playerTargetCardSelectable,
      ]}
    >
      <Text style={styles.playerTargetName}>JOUEUR {player}</Text>
      <Text style={styles.playerTargetHp}>PV : ∞</Text>
      <Text style={styles.playerTargetDamage}>Dégâts reçus : {damage}</Text>

      {status.poisoned && <Text style={styles.playerTargetStatus}>☠️ Poison</Text>}
      {status.burned && <Text style={styles.playerTargetStatus}>🔥 Brûlure</Text>}
      {status.extraDamageNextTurnReady && (
        <Text style={styles.playerTargetStatus}>
          🎯 +{status.extraDamageNextTurn} dégâts
        </Text>
      )}
    </Pressable>
  );
}
