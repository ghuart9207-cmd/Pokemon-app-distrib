
import { Button, Text, View } from 'react-native';

import { sharedStyles } from '@/features/game/styles/shared-styles';

type DiscardAllEnergyPromptProps = {
  pokemonName: string;
  bonusDamage: number;
  onChoose: (discard: boolean) => void;
};

export function DiscardAllEnergyPrompt({
  pokemonName,
  bonusDamage,
  onChoose,
}: DiscardAllEnergyPromptProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>
        ⚡ Défausser toutes les Énergies ?
      </Text>

      <Text style={sharedStyles.actionInfo}>
        {pokemonName}
      </Text>

      <Text style={sharedStyles.actionInfo}>
        Si tu choisis OUI, cette attaque inflige {bonusDamage} dégâts supplémentaires.
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          <Button
            title="OUI"
            onPress={() => onChoose(true)}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Button
            title="NON"
            onPress={() => onChoose(false)}
          />
        </View>
      </View>
    </View>
  );
}
