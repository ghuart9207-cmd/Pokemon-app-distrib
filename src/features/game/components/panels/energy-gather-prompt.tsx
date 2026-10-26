import { Button, Text, View } from 'react-native';

import type { PendingEnergyGather } from '@/features/game/types';
import { getTypeIcon } from '@/features/game/utils/card-labels';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type EnergyGatherPromptProps = {
  pending: PendingEnergyGather;
  onFinish: () => void;
};

/** Talent à la pose : déplacer des Énergies vers ce Pokémon, puis l'échanger. */
export function EnergyGatherPrompt({ pending, onFinish }: EnergyGatherPromptProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>✨ {pending.talentName}</Text>
      <Text style={sharedStyles.actionInfo}>
        Clique sur tes autres Pokémon pour déplacer leurs Énergies{' '}
        {getTypeIcon(pending.energyType)} {pending.energyType} vers ce Pokémon (une par clic).
      </Text>
      <Text style={sharedStyles.actionInfo}>Déplacées : {pending.moved}</Text>
      <Text style={sharedStyles.actionInfo}>
        {pending.moved > 0
          ? 'Ensuite, ce Pokémon devra échanger sa place avec un de tes Pokémon de la même ligne.'
          : "Si tu n'en déplaces aucune, il n'y a pas d'échange."}
      </Text>
      <Button title="Terminer" onPress={onFinish} />
    </View>
  );
}
