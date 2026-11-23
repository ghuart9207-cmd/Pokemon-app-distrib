import { Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import type { SummonChoices } from '@/features/game/rules';
import type { Player, PokemonCard } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';

import { SummonChoicePreview } from './summon-choice-preview';

type HandPokemonPreviewProps = {
  card: PokemonCard;
  owner: Player;
  currentPlayer: Player;
  summonChoices: SummonChoices;
};

/** Carte Pokémon d'une main : la sienne (sélectionnée) ou celle de l'adversaire (consultation). */
export function HandPokemonPreview({
  card,
  owner,
  currentPlayer,
  summonChoices,
}: HandPokemonPreviewProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>{card.name}</Text>
      <Text style={sharedStyles.actionInfo}>
        {owner === currentPlayer
          ? 'Carte de ta main'
          : `👀 Main du joueur ${owner} — consultation seulement`}
      </Text>
      <View style={sharedStyles.handPokemonPressable}>
        <PokemonHandCard card={card} />
      </View>
      <SummonChoicePreview card={card} summonChoices={summonChoices} />
    </View>
  );
}
