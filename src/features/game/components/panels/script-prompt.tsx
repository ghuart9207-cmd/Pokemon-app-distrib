import { Button, Text, View } from 'react-native';

import type { GameCard, PendingScript } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';

type ScriptPromptProps = {
  pending: PendingScript;
  onAnswer: (accept: boolean) => void;
  // étape 3 : cartes de la défausse proposées (recoverCards)
  cardChoices?: GameCard[];
  onChooseCard?: (index: number) => void;
  // blockAttack : attaques du Pokémon ciblé
  attackChoices?: string[];
};

/** Code des cartes : question OUI / NON, ou rappel du choix de cible en cours. */
export function ScriptPrompt({
  pending,
  onAnswer,
  cardChoices = [],
  onChooseCard,
  attackChoices = [],
}: ScriptPromptProps) {
  const block = pending.blocks[pending.index];
  if (!block) return null;

  if (pending.stage === 'optional') {
    const question =
      typeof block.optional === 'string' ? block.optional : "Appliquer l'effet ?";

    return (
      <View style={sharedStyles.actionBox}>
        <Text style={sharedStyles.actionTitle}>✨ {pending.sourceName}</Text>
        <Text style={sharedStyles.actionInfo}>{question}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Button title="OUI" onPress={() => onAnswer(true)} />
          <Button title="NON" onPress={() => onAnswer(false)} />
        </View>
      </View>
    );
  }

  if (pending.stage === 'target') {
    const needed = Math.max(1, block.target?.count ?? 1);
    const chosen = pending.chosenCells?.length ?? 0;
    const what =
      block.action === 'summon'
        ? `la case vide où ${block.pokemonName ?? 'le Pokémon'} apparaît`
        : block.action === 'switch'
          ? 'le Pokémon à déplacer'
          : block.action === 'moveEnergy' || block.action === 'moveDamage'
            ? 'le Pokémon de départ'
            : "le Pokémon qui reçoit l'effet";

    return (
      <View style={sharedStyles.actionBox}>
        <Text style={sharedStyles.actionTitle}>✨ {pending.sourceName}</Text>
        <Text style={sharedStyles.actionInfo}>
          Clique sur {what} ({chosen + 1}/{needed}).
        </Text>
      </View>
    );
  }

  if (pending.stage === 'destination') {
    return (
      <View style={sharedStyles.actionBox}>
        <Text style={sharedStyles.actionTitle}>✨ {pending.sourceName}</Text>
        <Text style={sharedStyles.actionInfo}>
          {block.action === 'switch'
            ? block.to?.emptyCells
              ? "Clique sur la case d'arrivée (case vide, ou un Pokémon pour échanger leur place)."
              : block.to?.anyRow
                ? 'Clique sur le Pokémon avec qui il échange sa place.'
                : 'Clique sur le Pokémon de la même ligne avec qui il échange sa place.'
            : block.action === 'moveEnergy'
              ? "Clique sur le Pokémon qui reçoit les Énergies."
              : 'Clique sur le Pokémon qui reçoit les dégâts.'}
        </Text>
      </View>
    );
  }

  if (pending.stage === 'attack') {
    return (
      <View style={sharedStyles.actionBox}>
        <Text style={sharedStyles.actionTitle}>✨ {pending.sourceName}</Text>
        <Text style={sharedStyles.actionInfo}>Choisis l&apos;attaque à bloquer.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {attackChoices.map((name, index) => (
            <Button key={`${name}-${index}`} title={name} onPress={() => onChooseCard?.(index)} />
          ))}
        </View>
      </View>
    );
  }

  if (pending.stage === 'card') {
    const wanted = Math.max(1, block.amount ?? 1);
    const picked = pending.pickedCards ?? 0;

    return (
      <View style={sharedStyles.actionBox}>
        <Text style={sharedStyles.actionTitle}>✨ {pending.sourceName}</Text>
        <Text style={sharedStyles.actionInfo}>
          Choisis une carte de ta défausse à reprendre en main ({picked + 1}/{wanted}).
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {cardChoices.map((card, index) => (
            <Button
              key={`${card.id}-${index}`}
              title={'maxHp' in card ? `${card.name} (${card.maxHp} PV)` : card.name}
              onPress={() => onChooseCard?.(index)}
            />
          ))}
          <Button title="Terminer" onPress={() => onChooseCard?.(-1)} />
        </View>
      </View>
    );
  }

  return null;
}
