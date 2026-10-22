import { Button, Text, View } from 'react-native';

import type { PendingKOEnergyMove } from '@/features/game/types';
import { getTypeIcon } from '@/features/game/utils/card-labels';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type KOEnergyPromptProps = {
  pending: PendingKOEnergyMove;
  onSelectEnergy: (energy: PendingKOEnergyMove['selectedEnergy']) => void;
};

export function KOEnergyPrompt({ pending, onSelectEnergy }: KOEnergyPromptProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>Relais d’Énergie</Text>
      <Text style={sharedStyles.actionInfo}>{pending.sourcePokemonName} est K.O.</Text>
      <Text style={sharedStyles.actionInfo}>
        Choisis l’Énergie à déplacer
        {pending.total > 1
          ? ` (${pending.total - pending.remaining + 1}/${pending.total})`
          : ''}{' '}
        :
      </Text>
      {Array.from(new Set(pending.availableEnergies)).map((energy) => (
        <Button
          key={energy}
          title={`${pending.selectedEnergy === energy ? '✅ ' : ''}${getTypeIcon(energy)} ${energy}`}
          onPress={() => onSelectEnergy(energy)}
        />
      ))}
      {pending.targetCell ? (
        <Text style={sharedStyles.actionInfo}>
          Elle ira sur le même Pokémon que la première.
        </Text>
      ) : (
        pending.selectedEnergy && (
          <Text style={sharedStyles.actionInfo}>
            Maintenant, clique sur l’un de tes Pokémon : il recevra les {pending.total} Énergies.
          </Text>
        )
      )}
    </View>
  );
}
