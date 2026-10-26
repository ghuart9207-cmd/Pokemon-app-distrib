import { Button, Text, View } from 'react-native';

import type { EnergyType } from '@/features/game/types';
import { getTypeIcon } from '@/features/game/utils/card-labels';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type OptionalDiscardPromptProps = {
  pokemonName: string;
  attackName: string;
  energyType: EnergyType;
  amount: number;
  effectText?: string;
  onChoose: (accept: boolean) => void;
};

/** « Vous pouvez défausser X Énergies… Dans ce cas, … » : choix OUI / NON. */
export function OptionalDiscardPrompt({
  pokemonName,
  attackName,
  energyType,
  amount,
  effectText,
  onChoose,
}: OptionalDiscardPromptProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>
        {getTypeIcon(energyType)} Défausser {amount} Énergie(s) {energyType} ?
      </Text>

      <Text style={sharedStyles.actionInfo}>
        {pokemonName} — {attackName}
      </Text>

      {effectText && <Text style={sharedStyles.actionInfo}>{effectText}</Text>}

      <Text style={sharedStyles.actionInfo}>
        OUI : les Énergies sont défaussées et l&apos;effet s&apos;applique. NON : seulement
        les dégâts.
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          <Button title="OUI" onPress={() => onChoose(true)} />
        </View>

        <View style={{ flex: 1 }}>
          <Button title="NON" onPress={() => onChoose(false)} />
        </View>
      </View>
    </View>
  );
}
