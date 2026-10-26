import { Pressable, ScrollView, Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import type { CardSeriesInfo } from '@/features/game/data';
import type { Player, PokemonCard } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type InvocationSetupScreenProps = {
  cardSeries: CardSeriesInfo;
  player: Player;
  invocationCards: PokemonCard[];
  setupPokemonPerRow: number;
  message: string;
  onAddCard: (card: PokemonCard) => void;
  onRemoveCard: (index: number) => void;
  onConfirm: () => void;
  // Règle de l'étape (par défaut : Fan Club, 2 Pokémon de Base ≤ 60 PV).
  requiredCount?: number;
  ruleText?: string;
  isCandidate?: (card: PokemonCard) => boolean;
};

const isFanClubCandidate = (card: PokemonCard) => card.stage === 'base' && card.maxHp <= 60;

export function InvocationSetupScreen({
  cardSeries,
  player,
  invocationCards,
  setupPokemonPerRow,
  message,
  onAddCard,
  onRemoveCard,
  onConfirm,
  requiredCount = 2,
  ruleText = 'Pokémon de Base ayant 60 PV ou moins',
  isCandidate = isFanClubCandidate,
}: InvocationSetupScreenProps) {
  const candidates = cardSeries.pokemon.filter(isCandidate);

  return (
    <ScrollView
      style={sharedStyles.screen}
      contentContainerStyle={sharedStyles.container}
    >
      <Text style={sharedStyles.title}>Choix des Invocations</Text>
      <Text style={sharedStyles.handTitle}>Joueur {player}</Text>
      <Text style={sharedStyles.actionInfo}>
        Choisis {requiredCount} {ruleText}.
      </Text>
      <Text style={sharedStyles.actionInfo}>
        {invocationCards.length}/{requiredCount} sélectionnés
      </Text>
      {requiredCount > 1 ? (
        <Text style={sharedStyles.actionInfo}>
          Tu peux choisir plusieurs fois le même Pokémon.
        </Text>
      ) : (
        <Text style={sharedStyles.actionInfo}>
          À chaque utilisation de l&apos;attaque, ce Pokémon sera invoqué (sans limite).
        </Text>
      )}

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

      {candidates.length === 0 && (
        <Text style={sharedStyles.actionInfo}>
          Aucun Pokémon de cette série ne correspond à cette règle.
        </Text>
      )}

      <Text style={sharedStyles.handTitle}>
        {requiredCount > 1 ? `Tes ${requiredCount} Invocations` : 'Ton Invocation'}
      </Text>
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
        <Text style={sharedStyles.attackButtonText}>{requiredCount > 1 ? `VALIDER LES ${requiredCount} INVOCATIONS` : "VALIDER L'INVOCATION"}</Text>
      </Pressable>

      <View style={sharedStyles.messageBox}>
        <Text style={sharedStyles.message}>{message}</Text>
      </View>
    </ScrollView>
  );
}
