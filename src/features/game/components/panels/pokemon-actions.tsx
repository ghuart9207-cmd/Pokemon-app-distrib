import { Pressable, Text, View } from 'react-native';

import { getDisplayedAttackDamage } from '@/features/game/rules';
import { getAvailablePokemonAttacks } from '@/features/game/utils/available-pokemon-attacks';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import type {
    BoardState,
    CoinAttackReference,
    CoinSide,
    GameCard,
    PokemonInPlay,
} from '@/features/game/types';
import {
    formatAttackCost,
    formatEnergies,
    getTypeIcon,
} from '@/features/game/utils/card-labels';
import { styles } from './pokemon-actions.styles';

type PokemonActionsProps = {
  pokemon: PokemonInPlay | null;
  cellName: string | null;
  board: BoardState;
  ownDiscard: GameCard[];
  selectedAttackIndex: number | null;
  readyCoinAttack: CoinAttackReference | null;
  turnId: number;
  currentPlayer: 1 | 2;
  onActivateTalent: () => void;
  round: number;
  player1Discard: GameCard[];
  player2Discard: GameCard[];
  onSelectAttack: (index: number, message: string) => void;
  onAttack: () => void;
  onRetreat: () => void;
  opponentPlayerPoisoned: boolean;
  opponentPlayerBurned: boolean;
};

export function PokemonActions({
  pokemon,
  cellName,
  board,
  ownDiscard,
  selectedAttackIndex,
  readyCoinAttack,
  turnId,
  currentPlayer,
  onActivateTalent,
  round,
  opponentPlayerPoisoned,
  opponentPlayerBurned,
  player1Discard,
  player2Discard,
  onSelectAttack,
  onAttack,
  onRetreat,
}: PokemonActionsProps) {
  if (!pokemon || !cellName) {
    return null;
  }

  const availableAttacks = getAvailablePokemonAttacks(
  pokemon,
  ownDiscard
);

  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>
        {getTypeIcon(pokemon.card.type)} {pokemon.card.name}
      </Text>
      <Text style={sharedStyles.actionInfo}>Case : {cellName}</Text>
      <Text style={sharedStyles.actionInfo}>
        Énergies : {formatEnergies(pokemon.energies)}
      </Text>

      {pokemon.card.talent && (
        <View>
          <Text style={sharedStyles.attackTitle}>
            ✨ Talent : {pokemon.card.talent.name}
          </Text>
          <Text style={sharedStyles.actionInfo}>{pokemon.card.talent.description}</Text>
          {pokemon.card.talent.type === 'passive' && (
            <Text style={sharedStyles.actionInfo}>🔵 Talent passif : toujours actif</Text>
          )}
        </View>
      )}

{pokemon.card.talent?.type === 'activated' &&
  pokemon.card.talent?.effect === 'attachEnergyOncePerTurn' && (
    <View>
      {pokemon.owner !== currentPlayer ? (
        <Text style={sharedStyles.actionInfo}>
          Tu ne peux utiliser que tes propres Talents.
        </Text>
      ) : pokemon.lastUsedTalentTurnId === turnId ? (
        <Text style={sharedStyles.actionInfo}>
          ✅ Talent déjà utilisé ce tour.
        </Text>
      ) : (
        <Pressable
          onPress={onActivateTalent}
          style={sharedStyles.attackButton}
        >
          <Text style={sharedStyles.attackButtonText}>
            ✨ UTILISER LE TALENT
          </Text>
        </Pressable>
      )}
    </View>
  )}

      <Text style={sharedStyles.attackTitle}>Attaques</Text>
      {pokemon.paralyzed && (
        <Text style={sharedStyles.actionInfo}>État : ⚡ Paralysé</Text>
      )}
      {pokemon.confused && <Text style={sharedStyles.actionInfo}>État : 🌀 Confus</Text>}
      {pokemon.asleep && <Text style={sharedStyles.actionInfo}>État : 😴 Endormi</Text>}

      {availableAttacks.map(
  ({ attack, copiedFromDiscard, sourcePokemonName }, index) => {
    const coinResult: CoinSide[] | undefined =
      readyCoinAttack?.cellName === cellName &&
      readyCoinAttack.attackIndex === index
        ? readyCoinAttack.coinResult
        : undefined;

    const damage = getDisplayedAttackDamage(
      pokemon,
      attack,
      coinResult,
      board,
      cellName,
      turnId,
      round,
      opponentPlayerPoisoned,
      opponentPlayerBurned,
      player1Discard,
      player2Discard
    );

    const displayedCost = copiedFromDiscard
      ? `${attack.energyCost} Énergie(s) — tous types acceptés`
      : formatAttackCost(attack);

    return (
      <View key={`${attack.name}-${index}-${sourcePokemonName ?? 'normal'}`}>
        {copiedFromDiscard && (
          <Text style={sharedStyles.actionInfo}>
            📚 Attaque copiée de {sourcePokemonName}
          </Text>
        )}

        <Pressable
          onPress={() =>
            onSelectAttack(
              index,
              `${attack.name} sélectionnée : ${damage} dégâts, coût ${displayedCost}.`
            )
          }
          style={[
            styles.attackChoice,
            selectedAttackIndex === index &&
              styles.selectedAttackChoice,
          ]}
        >
          <Text style={styles.attackChoiceName}>
            {attack.name}
          </Text>

          <Text style={styles.attackChoiceInfo}>
            {copiedFromDiscard
              ? `${attack.energyCost} Énergie(s) • tous types acceptés`
              : formatAttackCost(attack)}{' '}
            • Dégâts : {damage}
          </Text>

          {attack.effectText && (
            <Text style={styles.attackEffectText}>
              {attack.effectText}
            </Text>
          )}

          {attack.effects?.map((effect, effectIndex) => (
            <Text
              key={`${effect.type}-${effectIndex}`}
              style={styles.attackEffectText}
            >
              {effect.type === 'heal' &&
                `Soigne ${effect.amount} PV`}

              {effect.type === 'discardEnergy' &&
                `Défausse ${effect.amount} Énergie(s)`}

              {effect.type === 'recoil' &&
                `Subit ${effect.amount} dégâts de recul`}
            </Text>
          ))}
        </Pressable>
      </View>
    );
  }
)}

      <Pressable onPress={onAttack} style={sharedStyles.attackButton}>
        <Text style={sharedStyles.attackButtonText}>⚔️ ATTAQUER</Text>
      </Pressable>
      <Pressable onPress={onRetreat} style={styles.retreatButton}>
        <Text style={styles.retreatButtonText}>🔄 RETRAITE</Text>
      </Pressable>
    </View>
  );
}
