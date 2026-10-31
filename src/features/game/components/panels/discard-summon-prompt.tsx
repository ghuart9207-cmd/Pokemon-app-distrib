import { Pressable, Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import type { DiscardSummonCandidate } from '@/features/game/rules';
import type { PendingDiscardSummon, Player } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type DiscardSummonPromptProps = {
  pending: PendingDiscardSummon;
  candidates: DiscardSummonCandidate[];
  onSelect: (fromPlayer: Player, discardIndex: number) => void;
};

/** Choix du Pokémon à invoquer depuis la défausse du joueur ou de l'adversaire. */
export function DiscardSummonPrompt({ pending, candidates, onSelect }: DiscardSummonPromptProps) {
  const groups: { fromPlayer: Player; title: string }[] = [
    { fromPlayer: pending.player, title: 'Ta défausse → ton banc' },
    {
      fromPlayer: pending.player === 1 ? 2 : 1,
      title: 'Défausse adverse → banc adverse',
    },
  ];

  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>✨ {pending.attackName}</Text>
      <Text style={sharedStyles.actionInfo}>
        Choisis un Pokémon, puis une case libre du banc de son propriétaire.
      </Text>

      {groups.map(({ fromPlayer, title }) => {
        const groupCandidates = candidates.filter(
          (candidate) => candidate.fromPlayer === fromPlayer
        );

        return (
          <View key={fromPlayer} style={{ marginTop: 8 }}>
            <Text style={sharedStyles.handTitle}>{title}</Text>
            {groupCandidates.length === 0 ? (
              <Text style={sharedStyles.actionInfo}>Aucun Pokémon possible.</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {groupCandidates.map((candidate) => {
                  const isSelected =
                    pending.selected?.fromPlayer === candidate.fromPlayer &&
                    pending.selected?.discardIndex === candidate.discardIndex;

                  return (
                    <Pressable
                      key={`${candidate.fromPlayer}-${candidate.discardIndex}`}
                      onPress={() => onSelect(candidate.fromPlayer, candidate.discardIndex)}
                      style={sharedStyles.handPokemonPressable}
                    >
                      <PokemonHandCard card={candidate.card} />
                      <Text style={sharedStyles.actionInfo}>
                        {isSelected ? '✅ À invoquer' : 'Choisir'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
