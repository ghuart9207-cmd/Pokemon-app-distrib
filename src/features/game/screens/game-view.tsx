import { Text, View } from 'react-native';

import type { GameApi } from '@/features/game/hooks/use-game';
import type { Player } from '@/features/game/types';
import { useSetupLayout } from '@/features/game/hooks/use-setup-layout';
import {
  describeAttackInvocationRule,
  getSummonChoiceEffect,
  getSummonChoiceCount,
} from '@/features/game/rules';
import { DeckPicker } from '@/features/decks/components/deck-picker';

import { CardSetupScreen } from './card-setup-screen';
import { GamePlayScreen } from './game-play-screen';
import type { TutorialPanelInfo } from '@/features/game/components/panels/tutorial-panel';
import { InvocationSetupScreen } from './invocation-setup-screen';

type GameViewProps = {
  game: GameApi;
  // En ligne : le joueur de cet écran (1 ou 2). En local : non défini.
  localPlayer?: Player;
  // Création / modification d'un deck : pas de bouton « Decks », titre adapté.
  deckEditorTitle?: string;
  // Didacticiel : panneau d'étape à la place du message.
  tutorial?: TutorialPanelInfo;
};

/**
 * Affiche la préparation (cartes, invocations) puis le plateau de combat.
 * Il ne contient aucune logique : tout vient de `game`, ce qui permet de lui donner
 * soit le jeu local (GameScreen), soit un jeu synchronisé en ligne.
 */
export function GameView({ game, localPlayer, deckEditorTitle, tutorial }: GameViewProps) {
  const { isTablet, setupPokemonPerRow } = useSetupLayout();

  // En ligne : deck envoyé, on attend que l'adversaire ait fini le sien.
  if (
    localPlayer !== undefined &&
    game.setupPhase !== 'battle' &&
    game.setupSubmitted[localPlayer]
  ) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
          ✅ Ton deck est prêt !
        </Text>
        <Text style={{ color: '#cccccc', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
          En attente de ton adversaire, qui choisit encore ses cartes…
        </Text>
      </View>
    );
  }

  if (game.invocationSetupPlayer) {
    const setupPlayer = game.invocationSetupPlayer;

    // Invocation d'un Pokémon qui invoque (ex : Plumeline) : `amount` Pokémon à choisir.
    const summoner =
      game.invocationSetupKind === 'summonChoice' ? game.invocationSetupSummoner : null;
    const attackRule = summoner ? getSummonChoiceEffect(summoner) : null;

    return (
      <InvocationSetupScreen
        cardSeries={game.cardSeries}
        player={setupPlayer}
        invocationCards={
          attackRule
            ? game.summonChoiceDraft
            : setupPlayer === 1
              ? game.player1InvocationCards
              : game.player2InvocationCards
        }
        requiredCount={attackRule ? getSummonChoiceCount(attackRule) : 2}
        ruleText={
          attackRule && summoner
            ? `${describeAttackInvocationRule(attackRule)} que ${summoner.name} invoquera`
            : 'Pokémon de Base ayant 60 PV ou moins'
        }
        isCandidate={
          attackRule
            ? (card) => game.isSummonCandidate(card)
            : undefined
        }
        setupPokemonPerRow={setupPokemonPerRow}
        message={game.message}
        onAddCard={game.addInvocationSetupCard}
        onRemoveCard={game.removeInvocationSetupCard}
        onConfirm={game.confirmInvocationSetup}
      />
    );
  }

  if (game.setupPhase !== 'battle') {
    return (
      <CardSetupScreen
        cardSeries={game.cardSeries}
        setupPhase={game.setupPhase}
        player1SetupCards={game.player1SetupCards}
        player2SetupCards={game.player2SetupCards}
        setupPokemonPerRow={setupPokemonPerRow}
        isTablet={isTablet}
        message={game.message}
        getSetupCounts={game.getSetupCounts}
        onToggleCard={game.toggleSetupCard}
        onConfirm={game.confirmSetupSelection}
        titleOverride={deckEditorTitle}
        headerRight={
          deckEditorTitle ? undefined : (
            <DeckPicker series={game.cardSeries.id} onUseDeck={game.applySavedDeck} />
          )
        }
      />
    );
  }

  return (
    <GamePlayScreen
      // Partie
      board={game.board}
      
pendingDragonEnergyChoices={game.pendingDragonEnergyChoices}
onChooseDragonEnergy={game.chooseDragonEnergy}

      currentPlayer={game.currentPlayer}
      gameOver={game.gameOver}
      round={game.round}
      turnId={game.turnId}
      message={game.message}
      tutorial={tutorial}
      // Joueurs
      player1Hand={game.player1Hand}
      player2Hand={game.player2Hand}
      player1Discard={game.player1Discard}
      knockouts={game.knockouts}
      player2Discard={game.player2Discard}
      player1DiscardEnergies={game.player1DiscardEnergies}
      player2DiscardEnergies={game.player2DiscardEnergies}
      player1Damage={game.player1Damage}
      player2Damage={game.player2Damage}
      player1Status={game.player1Status}
      player2Status={game.player2Status}
      player1InvocationCards={game.player1InvocationCards}
      player2InvocationCards={game.player2InvocationCards}
      // Sélection
      selectedCard={game.selectedCard}
      selectedTrainerCard={game.selectedTrainerCard}
      selectedTrainerOwner={game.selectedTrainerOwner}
      selectedPokemonCell={game.selectedPokemonCell}
      selectedPokemon={game.selectedPokemon}
      onForfeit={game.forfeitGame}
      onUndoTurn={game.undoTurn}
      localPlayer={localPlayer}
      inspectedPokemon={game.inspectedPokemon}
      inspectedPokemonCell={game.inspectedPokemonCell}
      inspectedHandCard={game.inspectedHandCard}
      player1SummonChoices={game.player1SummonChoices}
      player2SummonChoices={game.player2SummonChoices}
      selectedAttackIndex={game.selectedAttackIndex}
      selectedAttachedTool={game.selectedAttachedTool}
      trainerEffectActivated={game.trainerEffectActivated}
      // Choix en attente
      pendingCoinFlip={game.pendingCoinFlip}
      coinDraft={game.coinDraft}
      pendingDiscardAllEnergyChoice={game.pendingDiscardAllEnergyChoice}
      onChooseDiscardAllEnergy={game.resolveDiscardAllEnergyChoice}
      pendingOptionalDiscardChoice={game.pendingOptionalDiscardChoice}
      onChooseOptionalDiscard={game.resolveOptionalDiscardChoice}
      pendingOptionalBonusDamageChoice={game.pendingOptionalBonusDamageChoice}
      pendingScript={game.pendingScript}
      onAnswerScriptOptional={game.answerScriptOptional}
      scriptCardChoices={game.scriptCardChoices}
      scriptAttackChoices={game.scriptAttackChoices}
      onAnswerScriptCard={game.answerScriptCard}
      pendingOptionalAttackEffect={game.pendingOptionalAttackEffect}
      onChooseOptionalAttackEffect={game.resolveOptionalAttackEffectChoice}
      onChooseOptionalBonusDamage={game.resolveOptionalBonusDamageChoice}
      onChooseOwnBenchDamageTarget={game.resolveOptionalOwnBenchDamageTarget}
      pendingKOEnergyMove={game.pendingKOEnergyMove}
      pendingInvocationPlacement={game.pendingInvocationPlacement}
      readyCoinAttack={game.readyCoinAttack}
      // Défausse
      openedDiscardPlayer={game.openedDiscardPlayer}
      openedDiscardCards={game.openedDiscardCards}
      onToggleDiscard={game.handleToggleDiscard}
      onCloseDiscardPreview={game.handleCloseDiscardPreview}
      onDiscardCardPress={game.handleDiscardCardPress}
      // Actions sur le plateau et les cartes
      onTargetPress={game.handlePlayerTargetPress}
      canSelectPlayerTarget={game.canSelectPlayerTarget}
      onHandCardPress={game.handleHandCardPress}
      onCellPress={game.handleCellPress}
      onToolPress={game.handleToolPress}
      onSelectKOEnergy={game.handleSelectKOEnergy}
      onSelectInvocation={game.handleSelectInvocation}
      pendingDiscardSummon={game.pendingDiscardSummon}
      discardSummonCandidates={game.discardSummonCandidates}
      onSelectDiscardSummon={game.selectDiscardSummonCard}
      pendingEnergyGather={game.pendingEnergyGather}
      onFinishEnergyGather={game.finishEnergyGather}
      onSelectEnergyGatherEnergy={game.selectEnergyGatherEnergy}
      onSelectAttack={game.handleSelectAttack}
      // Actions du tour
      onAttack={game.tryAttackSelectedPokemon}
      onRetreat={game.retreatSelectedPokemon}
      onActivateTalent={game.handleActivateTalent}
      onActivateTrainer={game.activateSelectedTrainerCard}
      onActivateInvocation={game.activateInvocationSupporter}
      onEndTurn={game.handleEndTurn}
      // Pile ou face
      onStartTrainerCoinFlip={game.startTrainerCoinFlip}
      onChooseCoinSide={game.chooseCoinSide}
      onValidateCoinFlip={game.validatePendingCoinFlip}
      canUseVictoriousTalent={game.canUseVictoriousTalent}
      victoriousTalentName={game.victoriousTalentName}
      onActivateVictoriousTalent={game.activateVictoriousTalent}
      // Nouvelle partie
      onRestartSameCards={game.restartSameCards}
      onRestart={game.restartGame}
    />
  );
}
