import { Pressable, ScrollView, Text, View } from 'react-native';

import { PlayerTargetCard } from '@/features/game/components/cards/player-target-card';
import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import { TrainerHandCard } from '@/features/game/components/cards/trainer-hand-card';
import { isPokemonCard } from '@/features/game/rules';
import type {
  GameCard,
  Player,
  PlayerStatusState,
  PokemonCard,
  TrainerCard,
} from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import { styles } from './player-hand-area.styles';

type PlayerHandAreaProps = {
  player: Player;
  hand: GameCard[];
  damage: number;
  status: PlayerStatusState;
  currentPlayer: Player;
  selectedCard: PokemonCard | null;
  selectedTrainerCard: TrainerCard | null;
  selectedTrainerOwner: Player | null;
  selectable: boolean;
  onTargetPress: (player: Player) => void;
  onHandCardPress: (card: GameCard, player: Player) => void;
};

export function PlayerHandArea({
  player,
  hand,
  damage,
  status,
  currentPlayer,
  selectedCard,
  selectedTrainerCard,
  selectedTrainerOwner,
  selectable,
  onTargetPress,
  onHandCardPress,
}: PlayerHandAreaProps) {
  return (
    <View style={styles.playerHandRow}>
      <PlayerTargetCard
        player={player}
        damage={damage}
        status={status}
        onPress={() => onTargetPress(player)}
        selectable={selectable}
      />

      <View style={styles.playerHandContent}>
        <Text style={sharedStyles.handTitle}>Main du joueur {player}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.hand}
          style={styles.handScroll}
        >
          {hand.length > 0 ? (
            hand.map((card) =>
              isPokemonCard(card) ? (
                <View
                  key={`j${player}-${card.id}`}
                  style={[
                    styles.handPokemonSelectionBorder,
                    currentPlayer === player && selectedCard?.id === card.id
                      ? styles.handPokemonSelected
                      : styles.handPokemonNotSelected,
                  ]}
                >
                  <Pressable
                    onPress={() => onHandCardPress(card, player)}
                    style={[
                      sharedStyles.handPokemonPressable,
                      currentPlayer !== player && sharedStyles.disabledCard,
                    ]}
                  >
                    <PokemonHandCard card={card} />
                  </Pressable>
                </View>
              ) : (
                <TrainerHandCard
                  key={`j${player}-${card.id}`}
                  card={card}
                  disabled={currentPlayer !== player && card.effect !== 'summonTwoBase60'}
                  isSelected={
                    selectedTrainerOwner === player && selectedTrainerCard?.id === card.id
                  }
                  onPress={() => onHandCardPress(card, player)}
                />
              )
            )
          ) : (
            <Text style={styles.emptyHand}>Aucune carte</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
