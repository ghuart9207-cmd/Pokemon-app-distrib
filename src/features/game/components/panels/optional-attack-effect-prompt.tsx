
import { Button, Text, View } from 'react-native';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type OptionalAttackEffectPromptProps = {
  pokemonName: string;
  message: string;
  onChoose: (accepted: boolean) => void;
};

export function OptionalAttackEffectPrompt({
  pokemonName,
  message,
  onChoose,
}: OptionalAttackEffectPromptProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>
        Effet optionnel
      </Text>

      <Text style={sharedStyles.actionInfo}>
        {pokemonName}
      </Text>

      <Text style={sharedStyles.actionInfo}>
        {message}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginTop: 10,
        }}
      >
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
