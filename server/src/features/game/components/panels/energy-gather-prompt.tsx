import { Button, Text, View } from 'react-native';

import type { EnergyType, PendingEnergyGather } from '@/features/game/types';
import { getTypeIcon } from '@/features/game/utils/card-labels';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type EnergyGatherPromptProps = {
  pending: PendingEnergyGather;
  onFinish: () => void;
  onSelectEnergy: (energy: EnergyType) => void;
};

/** Déplacer des Énergies de ses autres Pokémon vers un Pokémon (Talent à la pose ou attaque). */
export function EnergyGatherPrompt({ pending, onFinish, onSelectEnergy }: EnergyGatherPromptProps) {
  const typeText = pending.energyType
    ? ` ${getTypeIcon(pending.energyType)} ${pending.energyType}`
    : '';

  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>✨ {pending.talentName}</Text>
      <Text style={sharedStyles.actionInfo}>
        Clique sur tes autres Pokémon pour déplacer leurs Énergies{typeText} vers ce Pokémon (une
        par clic).
      </Text>
      <Text style={sharedStyles.actionInfo}>Déplacées : {pending.moved}</Text>

      {pending.sourceCell && pending.choiceTypes && pending.choiceTypes.length > 0 && (
        <View style={{ marginVertical: 8, gap: 6 }}>
          <Text style={sharedStyles.actionInfo}>Quelle Énergie déplacer ?</Text>
          {pending.choiceTypes.map((energy) => (
            <Button
              key={energy}
              title={`${getTypeIcon(energy)} ${energy}`}
              onPress={() => onSelectEnergy(energy)}
            />
          ))}
        </View>
      )}

      {!pending.fromAttack && (
        <Text style={sharedStyles.actionInfo}>
          {pending.moved > 0
            ? 'Ensuite, ce Pokémon devra échanger sa place avec un de tes Pokémon de la même ligne.'
            : "Si tu n'en déplaces aucune, il n'y a pas d'échange."}
        </Text>
      )}
      <Button title={pending.fromAttack ? "Fin de l'effet" : 'Terminer'} onPress={onFinish} />
    </View>
  );
}
