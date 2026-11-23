import { Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import { TrainerHandCard } from '@/features/game/components/cards/trainer-hand-card';
import { getSummonChoiceEffect, isPokemonCard } from '@/features/game/rules';
import type { SummonChoices } from '@/features/game/rules';
import type { GameCard } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type SummonChoicePreviewProps = {
  card: GameCard;
  summonChoices: SummonChoices;
};

/** Montre le Pokémon choisi à la préparation pour un Pokémon qui invoque. */
export function SummonChoicePreview({ card, summonChoices }: SummonChoicePreviewProps) {
  if (!getSummonChoiceEffect(card)) {
    return null;
  }

  const chosen = summonChoices[card.id] ?? [];

  return (
    <View style={{ marginTop: 10, alignItems: 'center' }}>
      <Text style={sharedStyles.attackTitle}>
        ✨ {chosen.length > 1 ? 'Invocations choisies' : 'Invocation choisie'}
      </Text>
      {chosen.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {chosen.map((chosenCard, index) => (
            <View key={`${chosenCard.id}-${index}`} style={sharedStyles.handPokemonPressable}>
              {isPokemonCard(chosenCard) ? (
                <PokemonHandCard card={chosenCard} />
              ) : (
                <TrainerHandCard card={chosenCard} disabled isSelected={false} onPress={() => {}} />
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text style={sharedStyles.actionInfo}>Aucune Invocation choisie.</Text>
      )}
    </View>
  );
}
