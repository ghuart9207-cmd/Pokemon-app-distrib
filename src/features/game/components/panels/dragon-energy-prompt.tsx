
import { Button, Modal, Text, View } from 'react-native';

import type {
  EnergyType,
  PokemonInPlay,
  PendingDragonEnergyChoice,
} from '@/features/game/types';
import { getTypeIcon } from '@/features/game/utils/card-labels';

type DragonEnergyPromptProps = {
  pokemon: PokemonInPlay | null;
  pending: PendingDragonEnergyChoice | null;
  onChoose: (energy: EnergyType) => void;
};

export function DragonEnergyPrompt({
  pokemon,
  pending,
  onChoose,
}: DragonEnergyPromptProps) {
  const energyTypes = pokemon?.card.dragonEnergyTypes;

  return (
    <Modal
      visible={pending !== null}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.65)',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            padding: 24,
            borderRadius: 14,
            width: '85%',
            maxWidth: 360,
            gap: 14,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            🐉 Énergie Dragon
          </Text>

          <Text style={{ textAlign: 'center' }}>
            Joueur {pending?.player} :
            choisis une Énergie pour {pokemon?.card.name}.
          </Text>

          <Text style={{ textAlign: 'center' }}>
            Choix restants : {pending?.remaining ?? 0}
          </Text>

          {energyTypes?.map((energy) => (
            <Button
              key={energy}
              title={`${getTypeIcon(energy)} ${energy}`}
              onPress={() => onChoose(energy)}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}
