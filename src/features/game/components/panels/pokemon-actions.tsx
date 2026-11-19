import { Pressable, Text, View } from 'react-native';

import {
  describeModifier,
  getActiveModifiers,
  getDisplayedAttackDamage,
  getKOPenalty,
  isTalentNegated,
} from '@/features/game/rules';
import { getAvailablePokemonAttacks } from '@/features/game/utils/available-pokemon-attacks';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import type {
    BoardState,
    CoinAttackReference,
    CoinSide,
    GameCard,
    PlayerAttackBonus,
    PokemonInPlay,
} from '@/features/game/types';
import {
    formatAttackCost,
    formatEnergies,
    getTypeIcon,
} from '@/features/game/utils/card-labels';
import { styles } from './pokemon-actions.styles';
import { SummonChoicePreview } from './summon-choice-preview';
import type { SummonChoices } from '@/features/game/rules';

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
  player1Hand: GameCard[];
  player2Hand: GameCard[];
  onSelectAttack: (index: number, message: string) => void;
  onAttack: () => void;
  onRetreat: () => void;
  // Invocations choisies à la préparation par le propriétaire de ce Pokémon.
  summonChoices?: SummonChoices;
  opponentPlayerPoisoned: boolean;
  opponentPlayerBurned: boolean;
  // Bonus d'attaque du propriétaire pendant ce tour (ex : Cynthia).
  ownAttackBonuses?: PlayerAttackBonus[];
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
  player1Hand,
  player2Hand,
  onSelectAttack,
  onAttack,
  onRetreat,
  summonChoices = {},
  ownAttackBonuses = [],
}: PokemonActionsProps) {
  if (!pokemon || !cellName) {
    return null;
  }

  // Talent annulé par un Pokémon adverse de la même colonne.
  const talentNegated = isTalentNegated(pokemon, board, cellName);

  const availableAttacks = getAvailablePokemonAttacks(
  pokemon,
  ownDiscard,
  talentNegated
);

  // Pokémon de l'adversaire : on peut le regarder, pas l'utiliser.
  const readOnly = pokemon.owner !== currentPlayer;

  return (
    <View style={sharedStyles.actionBox}>
      <Text style={sharedStyles.actionTitle}>
        {getTypeIcon(pokemon.card.type)} {pokemon.card.name}
      </Text>
      {readOnly && (
        <Text style={sharedStyles.actionInfo}>
          👀 Pokémon du joueur {pokemon.owner} — consultation seulement
        </Text>
      )}
      <Text style={sharedStyles.actionInfo}>Case : {cellName}</Text>
      <Text style={sharedStyles.actionInfo}>
        Énergies : {formatEnergies(pokemon.energies)}
      </Text>
      {pokemon.isInvocation && (
        <Text style={sharedStyles.actionInfo}>✨ Invocation</Text>
      )}
      {/* Pénalité reçue par son propre joueur si ce Pokémon est mis K.O. */}
      <Text style={sharedStyles.actionInfo}>
        💀 K.O. : +{getKOPenalty(pokemon.card.stage, pokemon.card.variant)} dégâts au joueur{' '}
        {pokemon.owner}
      </Text>

      {!!pokemon.outgoingAttackReduction && pokemon.outgoingAttackReductionEndPlayer && (
        <Text style={sharedStyles.actionInfo}>
          🔻 Ses attaques infligent {pokemon.outgoingAttackReduction} dégâts de moins pendant son prochain tour.
        </Text>
      )}

      {pokemon.attackCoinCheck && (
        <Text style={sharedStyles.actionInfo}>
          🪙 S'il attaque pendant son prochain tour : {pokemon.attackCoinCheck.coinCount} pièces à lancer avant
          (au moins un {pokemon.attackCoinCheck.failsOn === 'pile' ? 'PILE' : 'FACE'} = l'attaque ne fait rien).
        </Text>
      )}

      {pokemon.card.talent && (
        <View>
          <Text style={sharedStyles.attackTitle}>
            ✨ Talent : {pokemon.card.talent.name}
          </Text>
          <Text style={sharedStyles.actionInfo}>{pokemon.card.talent.description}</Text>
          {talentNegated && (
            <Text style={sharedStyles.actionInfo}>
              🚫 Talent annulé : un Pokémon adverse de sa colonne annule les Talents des Pokémon-GX et EX.
            </Text>
          )}
          {pokemon.card.talent.type === 'passive' && (
            <Text style={sharedStyles.actionInfo}>🔵 Talent passif : toujours actif</Text>
          )}
        </View>
      )}

{/* Code des cartes : effets en cours sur ce Pokémon */}
{[...getActiveModifiers(pokemon), ...(pokemon.scriptModifiers ?? []).filter((modifier) => modifier.startsIn > 0)].map(
  (modifier, index) => (
    <Text key={`modifier-${index}`} style={sharedStyles.actionInfo}>
      {modifier.startsIn > 0 ? '⏳' : '✨'} {modifier.sourceName} : {describeModifier(modifier)}
      {modifier.startsIn > 0 ? ' (plus tard)' : ''}
    </Text>
  )
)}

{pokemon.card.talent?.type === 'activated' &&
  !talentNegated &&
  (pokemon.card.talent?.effect === 'attachEnergyOncePerTurn' ||
    pokemon.card.talent?.effect === 'moveDamageCounterOncePerTurn' ||
    pokemon.card.talent?.effect === 'healOwnPokemonOncePerTurn' ||
    pokemon.card.talent?.effect === 'healAllOwnPokemonOncePerTurn' ||
    pokemon.card.talent?.effect === 'script' ||
    pokemon.card.talent?.effect === 'summonOncePerTurn' ||
    pokemon.card.talent?.effect === 'returnToolToHandOncePerTurn' ||
    pokemon.card.talent?.effect === 'switchWithBenchOncePerTurn' ||
    pokemon.card.talent?.effect === 'swapWithCardFromHand') && (
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
      player2Discard,
      player1Hand,
      player2Hand,
      ownAttackBonuses
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
          disabled={readOnly}
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
                (effect.optional
                  ? `Peut défausser ${effect.amount >= 99 ? 'toutes les' : effect.amount} Énergie(s)`
                  : `Défausse ${effect.amount >= 99 ? 'toutes les' : effect.amount} Énergie(s)`)}

              {effect.type === 'bonusDamage' &&
                (attack.effects?.some((other) => other.optional)
                  ? ` (dégâts affichés si tu défausses : sinon ${effect.amount} de moins)`
                  : '')}

              {effect.type === 'recoil' &&
                `Subit ${effect.amount} dégâts de recul`}
            </Text>
          ))}
        </Pressable>
      </View>
    );
  }
)}

      <SummonChoicePreview card={pokemon.card} summonChoices={summonChoices} />

      {!readOnly && (
        <>
          <Pressable onPress={onAttack} style={sharedStyles.attackButton}>
            <Text style={sharedStyles.attackButtonText}>⚔️ ATTAQUER</Text>
          </Pressable>
          <Pressable onPress={onRetreat} style={styles.retreatButton}>
            <Text style={styles.retreatButtonText}>🔄 RETRAITE</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
