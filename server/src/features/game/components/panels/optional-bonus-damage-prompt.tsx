import { Button, Text, View } from 'react-native';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type BenchTarget = {
  cellName: string;
  pokemonName: string;
};

type OptionalBonusDamagePromptProps = {
  pokemonName: string;
  bonusDamage: number;
  benchDamage: number;
  stage: 'choice' | 'target';
  benchTargets: BenchTarget[];
  onChooseBonus: (useBonus: boolean) => void;
  onChooseTarget: (cellName: string) => void;
};

export function OptionalBonusDamagePrompt({
  pokemonName,
  bonusDamage,
  benchDamage,
  stage,
  benchTargets,
  onChooseBonus,
  onChooseTarget,
}: OptionalBonusDamagePromptProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>
        {stage === 'choice'
          ? '⚡ Ajouter des dégâts ?'
          : '🎯 Choisis ton Pokémon de banc'}
      </Text>

      <Text style={sharedStyles.actionInfo}>{pokemonName}</Text>

      {stage === 'choice' ? (
        <>
          <Text style={sharedStyles.actionInfo}>
            Tu peux infliger {bonusDamage} dégâts supplémentaires à
            l'adversaire. Si tu le fais, un de tes Pokémon de banc subira{' '}
            {benchDamage} dégâts.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                title="OUI"
                onPress={() => onChooseBonus(true)}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Button
                title="NON"
                onPress={() => onChooseBonus(false)}
              />
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={sharedStyles.actionInfo}>
            Choisis le Pokémon qui subira {benchDamage} dégâts.
          </Text>

          {benchTargets.map((target) => (
            <View key={target.cellName} style={{ marginTop: 8 }}>
              <Button
                title={`${target.pokemonName} (${target.cellName})`}
                onPress={() => onChooseTarget(target.cellName)}
              />
            </View>
          ))}

          {benchTargets.length === 0 && (
            <Text style={sharedStyles.actionInfo}>
              Aucun Pokémon de banc disponible.
            </Text>
          )}

          <View style={{ marginTop: 10 }}>
            <Button
              title="Annuler le bonus"
              onPress={() => onChooseBonus(false)}
            />
          </View>
        </>
      )}
    </View>
  );
}