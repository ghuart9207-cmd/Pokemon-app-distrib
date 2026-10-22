import { Pressable, ScrollView, Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import { TrainerHandCard } from '@/features/game/components/cards/trainer-hand-card';
import { ALL_POKEMON_CARDS, ALL_TRAINER_CARDS } from '@/features/game/data';
import type { GameCard, Player, SetupPhase } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import { styles } from './card-setup-screen.styles';
import { MAX_GX_EX_IN_SETUP } from '@/features/game/hooks/use-game-setup';

type SetupCounts = {
  pokemonCount: number;
  gxExCount: number;
  objectCount: number;
  supporterCount: number;
};

type CardSetupScreenProps = {
  setupPhase: SetupPhase;
  player1SetupCards: GameCard[];
  player2SetupCards: GameCard[];
  setupPokemonPerRow: number;
  isTablet: boolean;
  message: string;
  getSetupCounts: (cards: GameCard[]) => SetupCounts;
  onToggleCard: (card: GameCard) => void;
  onConfirm: () => void;
};

export function CardSetupScreen({
  setupPhase,
  player1SetupCards,
  player2SetupCards,
  setupPokemonPerRow,
  isTablet,
  message,
  getSetupCounts,
  onToggleCard,
  onConfirm,
}: CardSetupScreenProps) {
  const setupPlayer: Player = setupPhase === 'player1' ? 1 : 2;
  const setupCards = setupPhase === 'player1' ? player1SetupCards : player2SetupCards;
  const { pokemonCount, gxExCount, objectCount, supporterCount } =
    getSetupCounts(setupCards);

  return (
    <ScrollView
      style={sharedStyles.screen}
      contentContainerStyle={sharedStyles.container}
    >
      <Text style={sharedStyles.title}>Pokémon Plateau</Text>

      <View style={sharedStyles.actionBox}>
        <Text style={sharedStyles.actionTitle}>
          Composition de la main du joueur {setupPlayer}
        </Text>
        <Text style={sharedStyles.actionInfo}>Pokémon : {pokemonCount}/8</Text>
        <Text style={sharedStyles.actionInfo}>
          dont GX / EX : {gxExCount}/{MAX_GX_EX_IN_SETUP} maximum
        </Text>
        <Text style={sharedStyles.actionInfo}>Objets : {objectCount}/3</Text>
        <Text style={sharedStyles.actionInfo}>Supporters : {supporterCount}/2</Text>
      </View>

      <Text style={sharedStyles.handTitle}>Choisis 8 Pokémon</Text>
      <View style={sharedStyles.setupPokemonRows}>
        {Array.from({
          length: Math.ceil(ALL_POKEMON_CARDS.length / setupPokemonPerRow),
        }).map((_, rowIndex) => {
          const rowCards = ALL_POKEMON_CARDS.slice(
            rowIndex * setupPokemonPerRow,
            rowIndex * setupPokemonPerRow + setupPokemonPerRow
          );

          return (
            <View key={`pokemon-row-${rowIndex}`} style={sharedStyles.setupPokemonRow}>
              {rowCards.map((card) => {
                const selected = setupCards.some(
                  (selectedCard) => selectedCard.id === card.id
                );

                return (
                  <View
                    key={card.id}
                    style={[
                      sharedStyles.setupPokemonCell,
                      { width: `${100 / setupPokemonPerRow}%` as `${number}%` },
                    ]}
                  >
                    <View
                      style={[
                        styles.setupPokemonSelectionBorder,
                        selected
                          ? styles.setupPokemonSelected
                          : styles.setupPokemonNotSelected,
                      ]}
                    >
                      <Pressable
                        onPress={() => onToggleCard(card)}
                        style={sharedStyles.handPokemonPressable}
                      >
                        <PokemonHandCard card={card} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      <Text style={sharedStyles.handTitle}>Choisis 3 Objets</Text>
      <View style={styles.setupGrid}>
        {ALL_TRAINER_CARDS.filter((card) => card.category === 'objet').map((card) => {
          const selected = setupCards.some((selectedCard) => selectedCard.id === card.id);

          return (
            <View
              key={card.id}
              style={[
                styles.setupGridCell,
                isTablet && { width: '20%', paddingHorizontal: 6 },
              ]}
            >
              <View
                style={[
                  styles.setupTrainerWrapper,
                  selected && styles.setupTrainerSelected,
                ]}
              >
                <TrainerHandCard
                  card={card}
                  disabled={false}
                  isSelected={selected}
                  onPress={() => onToggleCard(card)}
                />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={sharedStyles.handTitle}>Choisis 2 Supporters</Text>
      <View style={styles.setupGrid}>
        {ALL_TRAINER_CARDS.filter((card) => card.category === 'supporter').map((card) => {
          const selected = setupCards.some((selectedCard) => selectedCard.id === card.id);

          return (
            <View
              key={card.id}
              style={[
                styles.setupGridCell,
                isTablet && { width: '20%', paddingHorizontal: 6 },
              ]}
            >
              <View
                style={[
                  styles.setupTrainerWrapper,
                  selected && styles.setupTrainerSelected,
                ]}
              >
                <TrainerHandCard
                  card={card}
                  disabled={false}
                  isSelected={selected}
                  onPress={() => onToggleCard(card)}
                />
              </View>
            </View>
          );
        })}
      </View>

      <Pressable onPress={onConfirm} style={sharedStyles.attackButton}>
        <Text style={sharedStyles.attackButtonText}>
          {setupPhase === 'player1'
            ? 'VALIDER LA MAIN DU JOUEUR 1'
            : 'VALIDER ET COMMENCER LA PARTIE'}
        </Text>
      </Pressable>

      <View style={sharedStyles.messageBox}>
        <Text style={sharedStyles.message}>{message}</Text>
      </View>
    </ScrollView>
  );
}
