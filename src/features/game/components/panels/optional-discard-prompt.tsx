import { Button, Text, View } from 'react-native';

import type { EnergyType } from '@/features/game/types';
import { getTypeIcon } from '@/features/game/utils/card-labels';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type OptionalDiscardPromptProps = {
  pokemonName: string;
  attackName: string;
  // Absent : n'importe quel type d'Énergie.
  energyType?: EnergyType;
  amount: number;
  discardAll?: boolean;
  effectText?: string;
  onChoose: (accept: boolean) => void;
};

/** « Vous pouvez défausser X Énergies… Dans ce cas, … » : choix OUI / NON. */
export function OptionalDiscardPrompt({
  pokemonName,
  attackName,
  energyType,
  amount,
  discardAll,
  effectText,
  onChoose,
}: OptionalDiscardPromptProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>
        {discardAll
          ? `${energyType ? `${getTypeIcon(energyType)} ` : ''}Défausser toutes les Énergies${energyType ? ` ${energyType}` : ''} (${amount}) ?`
          : `${energyType ? `${getTypeIcon(energyType)} ` : ''}Défausser ${amount} Énergie(s)${energyType ? ` ${energyType}` : ''} ?`}
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
