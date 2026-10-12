import { Pressable, ScrollView, Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import { ALL_POKEMON_CARDS } from '@/features/game/data';
import type { Player, PokemonCard } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type InvocationSetupScreenProps = {
  player: Player;
  invocationCards: PokemonCard[];
  setupPokemonPerRow: number;
  message: string;
  onAddCard: (card: PokemonCard) => void;
  onRemoveCard: (index: number) => void;
  onConfirm: () => void;
};

export function InvocationSetupScreen({
  player,
  invocationCards,
  setupPokemonPerRow,
  message,
  onAddCard,
  onRemoveCard,
  onConfirm,
}: InvocationSetupScreenProps) {
  const candidates = ALL_POKEMON_CARDS.filter(
    (card) => card.stage === 'base' && card.maxHp <= 60
  );

  return (
    <ScrollView
      style={sharedStyles.screen}
      contentContainerStyle={sharedStyles.container}
    >
      <Text style={sharedStyles.title}>Choix des Invocations</Text>
      <Text style={sharedStyles.handTitle}>Joueur {player}</Text>
      <Text style={sharedStyles.actionInfo}>
        Choisis 2 Pokémon de Base ayant 60 PV ou moins.
      </Text>
      <Text style={sharedStyles.actionInfo}>{invocationCards.length}/2 sélectionnés</Text>
      <Text style={sharedStyles.actionInfo}>
        Tu peux choisir deux fois le même Pokémon.
      </Text>

      <View style={sharedStyles.setupPokemonRows}>
        {Array.from({
          length: Math.ceil(candidates.length / setupPokemonPerRow),
        }).map((_, rowIndex) => {
          const rowCards = candidates.slice(
            rowIndex * setupPokemonPerRow,
            rowIndex * setupPokemonPerRow + setupPokemonPerRow
          );

          return (
            <View key={`invocation-row-${rowIndex}`} style={sharedStyles.setupPokemonRow}>
              {rowCards.map((card) => {
                const count = invocationCards.filter(
                  (selected) => selected.id === card.id
                ).length;

                return (
                  <View
                    key={card.id}
                    style={[
                      sharedStyles.setupPokemonCell,
                      { width: `${100 / setupPokemonPerRow}%` as `${number}%` },
                    ]}
                  >
                    <Pressable
                      onPress={() => onAddCard(card)}
                      style={sharedStyles.handPokemonPressable}
                    >
                      <PokemonHandCard card={card} />
                    </Pressable>
                    {count > 0 && (
                      <Text style={sharedStyles.actionInfo}>Choisi x{count}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      <Text style={sharedStyles.handTitle}>Tes 2 Invocations</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {invocationCards.map((card, index) => (
          <Pressable
            key={`${card.id}-${index}`}
            onPress={() => onRemoveCard(index)}
            style={sharedStyles.handPokemonPressable}
          >
            <PokemonHandCard card={card} />
          </Pressable>
        ))}
      </View>

      <Pressable style={sharedStyles.attackButton} onPress={onConfirm}>
        <Text style={sharedStyles.attackButtonText}>VALIDER LES 2 INVOCATIONS</Text>
      </Pressable>

      <View style={sharedStyles.messageBox}>
        <Text style={sharedStyles.message}>{message}</Text>
      </View>
    </ScrollView>
  );
}
