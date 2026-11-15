import { Pressable, ScrollView, Text, View } from 'react-native';

import { PokemonBoard } from '@/features/game/components/board/pokemon-board';
import { AttachedToolPreview } from '@/features/game/components/panels/attached-tool-preview';
import { CoinFlipPrompt } from '@/features/game/components/panels/coin-flip-prompt';
import { DiscardPreview } from '@/features/game/components/panels/discard-preview';
import { InvocationPlacementPrompt } from '@/features/game/components/panels/invocation-placement-prompt';
import { DiscardSummonPrompt } from '@/features/game/components/panels/discard-summon-prompt';
import { EnergyGatherPrompt } from '@/features/game/components/panels/energy-gather-prompt';
import { HandPokemonPreview } from '@/features/game/components/panels/hand-pokemon-preview';
import { ForfeitButton } from '@/features/game/components/panels/forfeit-button';
import { UndoTurnButton } from '@/features/game/components/panels/undo-turn-button';
import type { SummonChoices } from '@/features/game/rules';
import type { DiscardSummonCandidate } from '@/features/game/rules';
import { KOEnergyPrompt } from '@/features/game/components/panels/ko-energy-prompt';
import { PokemonActions } from '@/features/game/components/panels/pokemon-actions';
import { TrainerActions } from '@/features/game/components/panels/trainer-actions';
import { DiscardPanel } from '@/features/game/components/player/discard-panel';
import { PlayerHandArea } from '@/features/game/components/player/player-hand-area';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import { DragonEnergyPrompt } from '@/features/game/components/panels/dragon-energy-prompt';
import { DiscardAllEnergyPrompt } from '@/features/game/components/panels/discard-all-energy-prompt';
import { OptionalDiscardPrompt } from '@/features/game/components/panels/optional-discard-prompt';
import { OptionalBonusDamagePrompt } from '@/features/game/components/panels/optional-bonus-damage-prompt';
import { OptionalAttackEffectPrompt } from '@/features/game/components/panels/optional-attack-effect-prompt';
import type {
    BoardState,
    CoinAttackReference,
    CoinSide,
    EnergyType,
    GameCard,
    PendingCoinFlip,
    PendingInvocationPlacement,
    PendingDiscardSummon,
    PendingEnergyGather,
    PendingKOEnergyMove,
    Player,
    PlayerStatusState,
    PokemonCard,
    PokemonInPlay,
    SelectedAttachedTool,
    TrainerCard,
    PendingDragonEnergyChoice,
} from '@/features/game/types';
import { styles } from './game-play-screen.styles';

type GamePlayScreenProps = {
  board: BoardState;
  currentPlayer: Player;
  gameOver: boolean;
  round: number;
  turnId: number;
  message: string;
  player1Hand: GameCard[];
  player2Hand: GameCard[];
  player1Discard: GameCard[];
  player2Discard: GameCard[];
  player1DiscardEnergies: EnergyType[];
  player2DiscardEnergies: EnergyType[];
  player1Damage: number;
  player2Damage: number;
  onDiscardCardPress: (card: GameCard, index: number, player: Player) => void;
  pendingDragonEnergyChoices: PendingDragonEnergyChoice[];
  onChooseDragonEnergy: (energy: EnergyType) => void;
  player1Status: PlayerStatusState;
  player2Status: PlayerStatusState;
  selectedCard: PokemonCard | null;
  selectedTrainerCard: TrainerCard | null;
  selectedTrainerOwner: Player | null;
  selectedPokemonCell: string | null;
  selectedPokemon: PokemonInPlay | null;
  inspectedPokemon: PokemonInPlay | null;
  inspectedPokemonCell: string | null;
  inspectedHandCard: { card: PokemonCard; owner: Player } | null;
  player1SummonChoices: SummonChoices;
  player2SummonChoices: SummonChoices;
  selectedAttackIndex: number | null;
  selectedAttachedTool: SelectedAttachedTool | null;
  player1InvocationCards: PokemonCard[];
  player2InvocationCards: PokemonCard[];
  trainerEffectActivated: boolean;
  pendingCoinFlip: PendingCoinFlip | null;
  coinDraft: (CoinSide | null)[];
    pendingDiscardAllEnergyChoice: {
    pokemonName: string;
    bonusDamage: number;
    coinResult?: CoinSide[];
  } | null;
  onChooseDiscardAllEnergy: (discard: boolean) => void;
  pendingOptionalDiscardChoice: {
    pokemonName: string;
    attackName: string;
    energyType?: EnergyType;
    amount: number;
    discardAll?: boolean;
    effectText?: string;
  } | null;
  onChooseOptionalDiscard: (accept: boolean) => void;
  pendingKOEnergyMove: PendingKOEnergyMove | null;
  pendingInvocationPlacement: PendingInvocationPlacement | null;
  readyCoinAttack: CoinAttackReference | null;
  openedDiscardPlayer: Player | null;
  openedDiscardCards: GameCard[];
  onTargetPress: (player: Player) => void;
  canSelectPlayerTarget: (player: Player) => boolean;
  onHandCardPress: (card: GameCard, player: Player) => void;
  onToggleDiscard: (player: Player) => void;
  onCloseDiscardPreview: () => void;
  onCellPress: (cellName: string) => void;
  onToolPress: (cellName: string, pokemon: PokemonInPlay) => void;
  onSelectKOEnergy: (energy: PendingKOEnergyMove['selectedEnergy']) => void;
  onSelectInvocation: (index: number) => void;
  pendingDiscardSummon: PendingDiscardSummon | null;
  discardSummonCandidates: DiscardSummonCandidate[];
  onSelectDiscardSummon: (fromPlayer: Player, discardIndex: number) => void;
  pendingEnergyGather: PendingEnergyGather | null;
  onFinishEnergyGather: () => void;
  onSelectEnergyGatherEnergy: (energy: EnergyType) => void;
  onSelectAttack: (index: number, message: string) => void;
  onAttack: () => void;
  onRetreat: () => void;
  onActivateTalent: () => void;
  onActivateTrainer: () => void;
  onActivateInvocation: () => void;
  onStartTrainerCoinFlip: (card: TrainerCard, player: Player, count: number) => void;
  onChooseCoinSide: (index: number, side: CoinSide) => void;
  onValidateCoinFlip: () => void;
  canUseVictoriousTalent: boolean;
  victoriousTalentName: string;
  onActivateVictoriousTalent: () => void;
  onEndTurn: () => void;
  onRestartSameCards: () => void;
  onForfeit: (player: Player) => void;
  onUndoTurn: () => void;
  // En ligne : le joueur de cet écran (c'est lui qui peut abandonner).
  localPlayer?: Player;
  onRestart: () => void;
  pendingOptionalAttackEffect: {
  pokemonName: string;
  message: string;
} | null;

onChooseOptionalAttackEffect: (accepted: boolean) => void;
  pendingOptionalBonusDamageChoice: {
  pokemonName: string;
  bonusDamage: number;
  benchDamage: number;
  owner: Player;
  attackerCell: string;
  stage: 'choice' | 'target';
} | null;

onChooseOptionalBonusDamage: (useBonus: boolean) => void;
onChooseOwnBenchDamageTarget: (cellName: string) => void;
};

export function GamePlayScreen(props: GamePlayScreenProps) {
  const pendingOptionalDamage = props.pendingOptionalBonusDamageChoice;

const optionalDamageBenchTargets: {
  cellName: string;
  pokemonName: string;
}[] = pendingOptionalDamage
  ? Object.entries(props.board).flatMap(([cellName, pokemon]) => {
      if (
        !pokemon ||
        pokemon.owner !== pendingOptionalDamage.owner ||
        cellName === pendingOptionalDamage.attackerCell
      ) {
        return [];
      }

      return [
        {
          cellName,
          pokemonName: pokemon.card.name,
        },
      ];
    })
  : [];
const dragonChoice = props.pendingDragonEnergyChoices[0] ?? null;

const dragonPokemon = dragonChoice
  ? props.board[dragonChoice.cellName]
  : null;

  // Carte Pokémon d'une main affichée : celle consultée chez l'adversaire,
  // sinon celle sélectionnée dans sa propre main.
  const handPreview = props.inspectedHandCard
    ?? (props.selectedCard ? { card: props.selectedCard, owner: props.currentPlayer } : null);

  return (
    <ScrollView
      style={sharedStyles.screen}
      contentContainerStyle={sharedStyles.container}
    >
      
{/* En ligne : seul le propriétaire du Pokémon Dragon choisit l'Énergie. */}
<DragonEnergyPrompt
  pokemon={dragonPokemon}
  pending={
    dragonChoice &&
    (props.localPlayer === undefined || props.localPlayer === dragonChoice.player)
      ? dragonChoice
      : null
  }
  onChoose={props.onChooseDragonEnergy}
/>
      <Text style={sharedStyles.title}>Pokémon Plateau</Text>
      <Text style={styles.round}>Manche {props.round} / 8</Text>
      <View style={styles.turnBox}>
        <Text style={styles.turnText}>
          {props.gameOver
            ? '🏁 FIN DE LA PARTIE'
            : `▶ Tour du joueur ${props.currentPlayer}`}
        </Text>
      </View>

      <Text style={styles.info}>Pose : B1 à B4 • Retraite : B → A</Text>
      <PlayerHandArea
        player={1}
        hand={props.player1Hand}
        damage={props.player1Damage}
        status={props.player1Status}
        currentPlayer={props.currentPlayer}
        selectedCard={props.selectedCard}
        selectedTrainerCard={props.selectedTrainerCard}
        selectedTrainerOwner={props.selectedTrainerOwner}
        selectable={props.canSelectPlayerTarget(1)}
        onTargetPress={props.onTargetPress}
        onHandCardPress={props.onHandCardPress}
      />
      <DiscardPanel
        player={1}
        cards={props.player1Discard}
        energies={props.player1DiscardEnergies}
        onToggle={props.onToggleDiscard}
      />

      {/* Message, côté joueur 1 : sous sa défausse, au-dessus du plateau. */}
      <View style={sharedStyles.messageBox}>
        <Text style={sharedStyles.message}>{props.message}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        scrollEnabled={props.openedDiscardPlayer === null}
        style={styles.battleAreaScroll}
        contentContainerStyle={styles.battleAreaScrollContent}
      >
        <View style={styles.battleAreaRow}>
          <View style={styles.boardWrapper}>
            <PokemonBoard
              board={props.board}
              selectedCell={props.selectedPokemonCell}
              onCellPress={props.onCellPress}
              onToolPress={props.onToolPress}
            />
          </View>
          <View style={styles.rightBattlePanel}>
            {props.openedDiscardPlayer && (
              <DiscardPreview
                player={props.openedDiscardPlayer}
                cards={props.openedDiscardCards}
                onClose={props.onCloseDiscardPreview}
                onCardPress={props.onDiscardCardPress}
              />
            )}
            {props.selectedAttachedTool && (
              <AttachedToolPreview card={props.selectedAttachedTool.card} />
            )}
            {props.pendingKOEnergyMove && (
              <KOEnergyPrompt
                pending={props.pendingKOEnergyMove}
                onSelectEnergy={props.onSelectKOEnergy}
              />
            )}
            {props.pendingInvocationPlacement && (
              <InvocationPlacementPrompt
                pending={props.pendingInvocationPlacement}
                onSelectIndex={props.onSelectInvocation}
              />
            )}
            {props.pendingEnergyGather && (
              <EnergyGatherPrompt
                pending={props.pendingEnergyGather}
                onFinish={props.onFinishEnergyGather}
                onSelectEnergy={props.onSelectEnergyGatherEnergy}
              />
            )}
            {props.pendingDiscardSummon && (
              <DiscardSummonPrompt
                pending={props.pendingDiscardSummon}
                candidates={props.discardSummonCandidates}
                onSelect={props.onSelectDiscardSummon}
              />
            )}
            {/* Carte Pokémon d'une main : la sienne (sélectionnée) ou l'adverse (consultation) */}
            {handPreview && (
              <HandPokemonPreview
                card={handPreview.card}
                owner={handPreview.owner}
                currentPlayer={props.currentPlayer}
                summonChoices={
                  handPreview.owner === 1
                    ? props.player1SummonChoices
                    : props.player2SummonChoices
                }
              />
            )}
            <PokemonActions
              pokemon={props.selectedPokemon ?? props.inspectedPokemon}
              cellName={props.selectedPokemon ? props.selectedPokemonCell : props.inspectedPokemonCell}
              summonChoices={
                (props.selectedPokemon ?? props.inspectedPokemon)?.owner === 2
                  ? props.player2SummonChoices
                  : props.player1SummonChoices
              }
              board={props.board}
              ownAttackBonuses={
                (props.selectedPokemon ?? props.inspectedPokemon)?.owner === 2
                  ? props.player2Status.attackBonusesThisTurn
                  : props.player1Status.attackBonusesThisTurn
              }
                opponentPlayerPoisoned={
    props.selectedPokemon?.owner === 1
      ? props.player2Status.poisoned
      : props.player1Status.poisoned
  }
  opponentPlayerBurned={
    props.selectedPokemon?.owner === 1
      ? props.player2Status.burned
      : props.player1Status.burned
  }
              ownDiscard={
  props.selectedPokemon?.owner === 1
    ? props.player1Discard
    : props.selectedPokemon?.owner === 2
      ? props.player2Discard
      : []
}
              selectedAttackIndex={props.selectedAttackIndex}
              readyCoinAttack={props.readyCoinAttack}
              turnId={props.turnId}
              currentPlayer={props.currentPlayer}
onActivateTalent={props.onActivateTalent}
              round={props.round}
                            player1Discard={props.player1Discard}
              player2Discard={props.player2Discard}
              player1Hand={props.player1Hand}
              player2Hand={props.player2Hand}
              onSelectAttack={props.onSelectAttack}
              onAttack={props.onAttack}
              onRetreat={props.onRetreat}
            />
            <TrainerActions
              card={props.selectedTrainerCard}
              owner={props.selectedTrainerOwner}
              currentPlayer={props.currentPlayer}
              player1InvocationCards={props.player1InvocationCards}
              player2InvocationCards={props.player2InvocationCards}
              trainerEffectActivated={props.trainerEffectActivated}
              coinFlipPending={props.pendingCoinFlip !== null}
              onActivate={props.onActivateTrainer}
              onActivateInvocation={props.onActivateInvocation}
              onStartCoinFlip={props.onStartTrainerCoinFlip}
            />
            {props.pendingCoinFlip && (
              <CoinFlipPrompt
                pending={props.pendingCoinFlip}
                draft={props.coinDraft}
                onChooseSide={props.onChooseCoinSide}
                onValidate={props.onValidateCoinFlip}
                canUseVictoriousTalent={props.canUseVictoriousTalent}
                victoriousTalentName={props.victoriousTalentName}
                onActivateVictoriousTalent={props.onActivateVictoriousTalent}
              />
            )}

            {props.pendingOptionalDiscardChoice && (
              <OptionalDiscardPrompt
                pokemonName={props.pendingOptionalDiscardChoice.pokemonName}
                attackName={props.pendingOptionalDiscardChoice.attackName}
                energyType={props.pendingOptionalDiscardChoice.energyType}
                amount={props.pendingOptionalDiscardChoice.amount}
                discardAll={props.pendingOptionalDiscardChoice.discardAll}
                effectText={props.pendingOptionalDiscardChoice.effectText}
                onChoose={props.onChooseOptionalDiscard}
              />
            )}

            {props.pendingDiscardAllEnergyChoice && (
  <DiscardAllEnergyPrompt
    pokemonName={props.pendingDiscardAllEnergyChoice.pokemonName}
    bonusDamage={props.pendingDiscardAllEnergyChoice.bonusDamage}
    onChoose={props.onChooseDiscardAllEnergy}
  />
)}

{props.pendingOptionalBonusDamageChoice && (
  <OptionalBonusDamagePrompt
    pokemonName={props.pendingOptionalBonusDamageChoice.pokemonName}
    bonusDamage={props.pendingOptionalBonusDamageChoice.bonusDamage}
    benchDamage={props.pendingOptionalBonusDamageChoice.benchDamage}
    stage={props.pendingOptionalBonusDamageChoice.stage}
    benchTargets={optionalDamageBenchTargets}
    onChooseBonus={props.onChooseOptionalBonusDamage}
    onChooseTarget={props.onChooseOwnBenchDamageTarget}
  />
)}

{props.pendingOptionalAttackEffect && (
  <OptionalAttackEffectPrompt
    pokemonName={props.pendingOptionalAttackEffect.pokemonName}
    message={props.pendingOptionalAttackEffect.message}
    onChoose={props.onChooseOptionalAttackEffect}
  />
)}
          </View>
        </View>
      </ScrollView>

      {/* Message, côté joueur 2 : sous le plateau, au-dessus de sa zone. */}
      <View style={sharedStyles.messageBox}>
        <Text style={sharedStyles.message}>{props.message}</Text>
      </View>

      <Text style={styles.info}>Pose : C1 à C4 • Retraite : C → D</Text>
      <PlayerHandArea
        player={2}
        hand={props.player2Hand}
        damage={props.player2Damage}
        status={props.player2Status}
        currentPlayer={props.currentPlayer}
        selectedCard={props.selectedCard}
        selectedTrainerCard={props.selectedTrainerCard}
        selectedTrainerOwner={props.selectedTrainerOwner}
        selectable={props.canSelectPlayerTarget(2)}
        onTargetPress={props.onTargetPress}
        onHandCardPress={props.onHandCardPress}
      />
      <DiscardPanel
        player={2}
        cards={props.player2Discard}
        energies={props.player2DiscardEnergies}
        onToggle={props.onToggleDiscard}
      />

      {!props.gameOver && (
        <Pressable onPress={props.onEndTurn} style={styles.endTurnButton}>
          <Text style={styles.endTurnText}>FIN DU TOUR</Text>
        </Pressable>
      )}
      {/* Seul le joueur dont c'est le tour peut annuler (en ligne : sur son appareil). */}
      {!props.gameOver &&
        (props.localPlayer === undefined || props.localPlayer === props.currentPlayer) && (
          <UndoTurnButton player={props.currentPlayer} onUndo={props.onUndoTurn} />
        )}
      {!props.gameOver && (
        <ForfeitButton
          player={props.localPlayer ?? props.currentPlayer}
          onForfeit={props.onForfeit}
        />
      )}
      <Pressable onPress={props.onRestartSameCards} style={styles.restartButton}>
        <Text style={styles.restartButtonText}>🔄 RECOMMENCER AVEC LES MÊMES CARTES</Text>
      </Pressable>
      <Pressable onPress={props.onRestart} style={styles.restartButton}>
        <Text style={styles.restartButtonText}>↩️ REVENIR AU CHOIX DES CARTES</Text>
      </Pressable>
    </ScrollView>
  );
}
