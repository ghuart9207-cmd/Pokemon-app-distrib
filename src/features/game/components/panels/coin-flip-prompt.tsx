import { Button, Text, View } from 'react-native';

import type { CoinSide, PendingCoinFlip } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type CoinFlipPromptProps = {
  pending: PendingCoinFlip;
  draft: (CoinSide | null)[];
  onChooseSide: (index: number, side: CoinSide) => void;
  onValidate: () => void;
  // Talent Victorieux : bouton affiché seulement quand il peut être utilisé.
  canUseVictoriousTalent?: boolean;
  victoriousTalentName?: string;
  onActivateVictoriousTalent?: () => void;
};

export function CoinFlipPrompt({
  pending,
  draft,
  onChooseSide,
  onValidate,
  canUseVictoriousTalent = false,
  victoriousTalentName = 'Victorieux',
  onActivateVictoriousTalent,
}: CoinFlipPromptProps) {
  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>🪙 Lancer de pièces</Text>
      <Text style={sharedStyles.actionInfo}>{pending.sourceName}</Text>
      <Text style={sharedStyles.actionInfo}>Nombre de pièces : {pending.coinCount}</Text>
      <Text style={sharedStyles.actionInfo}>
        {pending.resolution.choiceAllowed
          ? 'Choisis le résultat :'
          : pending.resolution.reason === 'history'
            ? 'Résultat imposé par le lancer précédent.'
            : 'Résultat imposé par une carte Dresseur.'}
      </Text>

      {draft.map((side, index) => (
        <View key={index} style={{ marginVertical: 5 }}>
          <Text style={sharedStyles.actionInfo}>
            Pièce {index + 1} :{' '}
            {side === 'face' ? 'FACE' : side === 'pile' ? 'PILE' : '?'}
          </Text>
          {pending.resolution.choiceAllowed && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="FACE" onPress={() => onChooseSide(index, 'face')} />
              <Button title="PILE" onPress={() => onChooseSide(index, 'pile')} />
            </View>
          )}
        </View>
      ))}

      {pending.victoriousUsed && (
        <Text style={sharedStyles.actionInfo}>
          ✨ Pièces relancées grâce au Talent {victoriousTalentName}.
        </Text>
      )}

      <Button title="Valider le lancer" onPress={onValidate} />

      {canUseVictoriousTalent && onActivateVictoriousTalent && (
        <View style={{ marginTop: 8 }}>
          <Button
            title={`✨ Activer talent ${victoriousTalentName}`}
            color="#d71920"
            onPress={onActivateVictoriousTalent}
          />
        </View>
      )}
    </View>
  );
}
