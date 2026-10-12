import { Button, Pressable, Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import type { Player, PokemonInPlay, TrainerCard } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type TrainerActionsProps = {
  card: TrainerCard | null;
  owner: Player | null;
  currentPlayer: Player;
  player1InvocationCards: PokemonInPlay['card'][];
  player2InvocationCards: PokemonInPlay['card'][];
  trainerEffectActivated: boolean;
  coinFlipPending: boolean;
  onActivate: () => void;
  onActivateInvocation: () => void;
  onStartCoinFlip: (card: TrainerCard, player: Player, coinCount: number) => void;
};

export function TrainerActions({
  card,
  owner,
  currentPlayer,
  player1InvocationCards,
  player2InvocationCards,
  trainerEffectActivated,
  coinFlipPending,
  onActivate,
  onActivateInvocation,
  onStartCoinFlip,
}: TrainerActionsProps) {
  if (!card) {
    return null;
  }

  const invocationCards = owner === 1 ? player1InvocationCards : player2InvocationCards;

  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>{card.name}</Text>
      <Text style={sharedStyles.actionInfo}>
        {card.category === 'objet' ? 'Objet' : 'Supporter'}
      </Text>
      <Text style={sharedStyles.actionInfo}>{card.description}</Text>

      {card.effect === 'summonTwoBase60' && owner && (
        <View>
          <Text style={sharedStyles.attackTitle}>✨ Invocations associées</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 8,
            }}
          >
            {invocationCards.map((pokemonCard, index) => (
              <View
                key={`invocation-preview-${owner}-${pokemonCard.id}-${index}`}
                style={sharedStyles.handPokemonPressable}
              >
                <PokemonHandCard card={pokemonCard} />
              </View>
            ))}
          </View>
        </View>
      )}

      {owner === currentPlayer &&
        card.effect !== 'coinReturnPokemonToHand' &&
        !trainerEffectActivated &&
        !coinFlipPending && (
          <Pressable
            onPress={
              card.effect === 'summonTwoBase60' ? onActivateInvocation : onActivate
            }
            style={sharedStyles.attackButton}
          >
            <Text style={sharedStyles.attackButtonText}>▶ ACTIVER</Text>
          </Pressable>
        )}

      {card.coinCount && !coinFlipPending && (
        <Button
          title={`🪙 Lancer ${card.coinCount} pièce${card.coinCount > 1 ? 's' : ''}`}
          onPress={() => onStartCoinFlip(card, currentPlayer, card.coinCount!)}
        />
      )}
    </View>
  );
}
