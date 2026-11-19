import { ALL_SERIES_POKEMON_CARDS, ALL_SERIES_TRAINER_CARDS } from '@/features/game/data';
import type { GameApi } from '@/features/game/hooks/use-game';
import type {
  CoinSide,
  GameCard,
  PokemonCard,
  Player,
  TrainerCard,
} from '@/features/game/types';

import type { ActionName, OnlineAction, Seat } from './protocol';

type SendAction = (name: ActionName, payload: unknown[]) => void;

const CATALOG: GameCard[] = [...ALL_SERIES_POKEMON_CARDS, ...ALL_SERIES_TRAINER_CARDS];

/**
 * Retrouve une carte à partir de son identifiant.
 * On cherche d'abord dans les mains (pour garder les mêmes objets que le jeu), puis dans le catalogue.
 */
function findCard(id: string, game: GameApi): GameCard {
  const card =
    game.player1Hand.find((candidate) => candidate.id === id) ??
    game.player2Hand.find((candidate) => candidate.id === id) ??
    CATALOG.find((candidate) => candidate.id === id);

  if (!card) throw new Error(`Carte inconnue : ${id}`);
  return card;
}

/**
 * Remplace les actions du jeu par des versions qui les envoient au serveur.
 * Rien ne se passe sur l'écran tant que le serveur n'a pas renvoyé l'action aux DEUX joueurs :
 * ainsi les deux écrans appliquent exactement les mêmes actions, dans le même ordre.
 *
 * Seules les cartes sont transmises par leur identifiant (une image ne peut pas voyager sur le réseau).
 */
export function createOnlineGame(game: GameApi, send: SendAction): GameApi {
  return {
    ...game,

    // Plateau et cartes
    handleCellPress: (cellName: string) => send('cell', [cellName]),
    handleHandCardPress: (card: GameCard, owner: Player) =>
      send('hand', [card.id, owner]),
    handlePlayerTargetPress: (player: Player) => send('target', [player]),
    handleToolPress: (cellName: string) => send('tool', [cellName]),
    handleSelectKOEnergy: (energy: Parameters<GameApi['handleSelectKOEnergy']>[0]) =>
      send('koEnergy', [energy]),
    handleSelectInvocation: (index: number) => send('invocationSelect', [index]),
    handleSelectAttack: (index: number, message: string) =>
      send('selectAttack', [index, message]),

    // Actions du tour
    tryAttackSelectedPokemon: () => send('attack', []),
    retreatSelectedPokemon: () => send('retreat', []),
    activateSelectedTrainerCard: () => send('trainer', []),
    activateInvocationSupporter: () => send('invocationSupporter', []),
    handleEndTurn: () => send('endTurn', []),

    // Pile ou face
    startTrainerCoinFlip: (card: TrainerCard, player: Player, count: number) =>
      send('trainerCoin', [card.id, player, count]),
    chooseCoinSide: (index: number, side: CoinSide) => send('coinSide', [index, side]),
    validatePendingCoinFlip: () => send('validateCoin', []),
    activateVictoriousTalent: () => send('victorious', []),
    handleActivateTalent: () => send('talent', []),
    resolveOptionalDiscardChoice: (accept: boolean) => send('optionalDiscard', [accept]),
    // Panneaux de choix des attaques (OUI / NON, cible sur son banc)
    resolveDiscardAllEnergyChoice: (discard: boolean) =>
      send('discardAllChoice', [discard]),
    resolveOptionalBonusDamageChoice: (useBonus: boolean) =>
      send('optionalBonusChoice', [useBonus]),
    resolveOptionalOwnBenchDamageTarget: (cellName: string) =>
      send('ownBenchTarget', [cellName]),
    resolveOptionalAttackEffectChoice: (accepted: boolean) =>
      send('optionalEffectChoice', [accepted]),
    selectDiscardSummonCard: (fromPlayer: Player, discardIndex: number) =>
      send('discardSummonSelect', [fromPlayer, discardIndex]),
    finishEnergyGather: () => send('energyGatherDone', []),
    selectEnergyGatherEnergy: (energy: Parameters<GameApi['selectEnergyGatherEnergy']>[0]) =>
      send('energyGatherSelect', [energy]),
    forfeitGame: (player: Player) => send('forfeit', [player]),
    undoTurn: () => send('undoTurn', []),
    answerScriptOptional: (accept: boolean) => send('scriptOptional', [accept]),
    answerScriptCard: (index: number) => send('scriptCard', [index]),
    chooseDragonEnergy: (energy: Parameters<GameApi['chooseDragonEnergy']>[0]) =>
      send('dragonEnergy', [energy]),

    // Nouvelle partie
    restartGame: () => send('restart', []),
    restartSameCards: () => send('restartSame', []),

    // Préparation des cartes et des invocations
    // Choix du deck : chacun choisit de son côté, en même temps (rien n'est envoyé).
    // Le deck complet part en une fois à la fin (action 'setupSubmit', voir useOnlineGame).
  };
}

/** Marqueur d'une action « emballée » dans une action 'cell' (compatibilité anciens serveurs). */
export const TUNNEL_MARKER = '__action';

/**
 * Applique sur CE jeu une action reçue du serveur (qu'elle vienne de moi ou de l'adversaire).
 * `game` doit être le jeu local d'origine, pas la version qui envoie au serveur.
 */
export function applyAction(action: OnlineAction, game: GameApi): void {
  const [first, second, third] = action.payload;

  switch (action.name) {
    case 'cell': {
      // Action « emballée » (voir TUNNELED_ACTIONS) : on applique la vraie action.
      if (first === TUNNEL_MARKER) {
        return applyAction(
          { ...action, name: second as ActionName, payload: action.payload.slice(2) },
          game
        );
      }
      // Choix réservé à un joueur précis (ex : Corde Sortie) : on ignore les clics de l'autre.
      const owner = getCellPressOwner(game);
      if (owner !== null && owner !== action.from) return;
      return game.handleCellPress(String(first));
    }
    case 'hand':
      return game.handleHandCardPress(findCard(String(first), game), second as Player);
    case 'target':
      return game.handlePlayerTargetPress(first as Player);
    case 'tool': {
      const cellName = String(first);
      const pokemon = game.board[cellName];
      if (pokemon) game.handleToolPress(cellName, pokemon);
      return;
    }
    case 'koEnergy':
      return game.handleSelectKOEnergy(
        first as Parameters<GameApi['handleSelectKOEnergy']>[0]
      );
    case 'invocationSelect':
      return game.handleSelectInvocation(Number(first));
    case 'selectAttack':
      return game.handleSelectAttack(Number(first), String(second));

    case 'attack':
      return game.tryAttackSelectedPokemon();
    case 'retreat':
      return game.retreatSelectedPokemon();
    case 'trainer':
      return game.activateSelectedTrainerCard();
    case 'invocationSupporter':
      return game.activateInvocationSupporter();
    case 'endTurn':
      return game.handleEndTurn();

    case 'trainerCoin':
      return game.startTrainerCoinFlip(
        findCard(String(first), game) as TrainerCard,
        second as Player,
        Number(third)
      );
    case 'coinSide':
      return game.chooseCoinSide(Number(first), second as CoinSide);
    case 'validateCoin':
      return game.validatePendingCoinFlip();
    case 'victorious':
      return game.activateVictoriousTalent();
    case 'talent':
      return game.handleActivateTalent();
    case 'optionalDiscard':
      return game.resolveOptionalDiscardChoice(first === true);
    case 'discardAllChoice':
      return game.resolveDiscardAllEnergyChoice(first === true);
    case 'optionalBonusChoice':
      return game.resolveOptionalBonusDamageChoice(first === true);
    case 'ownBenchTarget':
      return game.resolveOptionalOwnBenchDamageTarget(String(first));
    case 'optionalEffectChoice':
      return game.resolveOptionalAttackEffectChoice(first === true);
    case 'discardSummonSelect':
      return game.selectDiscardSummonCard(first as Player, Number(second));
    case 'energyGatherDone':
      return game.finishEnergyGather();
    case 'energyGatherSelect':
      return game.selectEnergyGatherEnergy(first as Parameters<GameApi['selectEnergyGatherEnergy']>[0]);
    case 'forfeit':
      // Seul le joueur lui-même peut abandonner : on utilise le siège de l'envoyeur.
      return game.forfeitGame(action.from);

    case 'dragonEnergy': {
      // Seul le propriétaire du Pokémon Dragon choisit son Énergie.
      const pending = game.pendingDragonEnergyChoices[0];
      if (!pending || pending.player !== action.from) return;
      return game.chooseDragonEnergy(first as Parameters<GameApi['chooseDragonEnergy']>[0]);
    }
    case 'scriptOptional':
      // Seul le joueur du script répond à sa question.
      if (!game.pendingScript || game.pendingScript.player !== action.from) return;
      return game.answerScriptOptional(Boolean(first));
    case 'scriptCard':
      // Seul le joueur du script choisit la carte de sa défausse.
      if (!game.pendingScript || game.pendingScript.player !== action.from) return;
      return game.answerScriptCard(Number(first));
    case 'undoTurn':
      // Seul le joueur dont c'est le tour peut annuler son tour.
      if (action.from !== game.currentPlayer) return;
      return game.undoTurn();
    case 'restart':
      return game.restartGame();
    case 'restartSame':
      return game.restartSameCards();

    case 'setupSubmit': {
      const payload = first as Parameters<GameApi['applyOnlineSetupSubmit']>[0];
      // Chacun n'envoie que son propre deck.
      if (!payload || payload.player !== action.from) return;
      return game.applyOnlineSetupSubmit(payload);
    }
    case 'setupToggle':
      return game.toggleSetupCard(findCard(String(first), game));
    case 'setupConfirm':
      return game.confirmSetupSelection();
    case 'invAdd':
      return game.addInvocationSetupCard(findCard(String(first), game) as PokemonCard);
    case 'invRemove':
      return game.removeInvocationSetupCard(Number(first));
    case 'invConfirm':
      return game.confirmInvocationSetup();
  }
}

/**
 * Qui a le droit d'agir en ce moment ?
 * - préparation des cartes : le joueur dont c'est le tour de choisir
 * - combat : le joueur dont c'est le tour, plus celui à qui un choix en attente est demandé
 *   (pile ou face, échange forcé de son Pokémon actif, etc.)
 * - partie terminée : les deux (pour relancer)
 */
export function getActiveSeats(game: GameApi): Seat[] {
  if (game.invocationSetupPlayer) return [game.invocationSetupPlayer];
  if (game.setupPhase === 'player1') return [1];
  if (game.setupPhase === 'player2') return [2];
  if (game.gameOver) return [1, 2];

  const seats = new Set<Player>([game.currentPlayer]);
  const addSeat = (player: Player | null | undefined) => {
    if (player) seats.add(player);
  };

  addSeat(game.pendingCoinFlip?.player);
  addSeat(game.pendingKOEnergyMove?.player);
  addSeat(game.pendingInvocationPlacement?.player);
  addSeat(game.pendingCoinReturnToHand?.player);
  addSeat(game.pendingGeneratedBenchEnergy?.player);
  addSeat(game.pendingBenchEnergyAttachment?.player);
  addSeat(game.pendingPokemonSwitch?.player);
  addSeat(game.pendingOpponentTarget?.player);
  addSeat(game.pendingOpponentActiveSwitch?.player);
  addSeat(game.pendingKOSurvival?.player);
  addSeat(game.pendingBothPlayersSwitch?.controlledBy);
  addSeat(game.pendingDragonEnergyChoices[0]?.player);
  addSeat(game.pendingScript?.player);

  return [...seats];
}

/**
 * Joueur qui doit cliquer sur le plateau pour le choix en cours, quand ce n'est
 * pas forcément le joueur dont c'est le tour (sinon null : règles habituelles).
 */
export function getCellPressOwner(game: GameApi): Seat | null {
  if (game.pendingScript) return game.pendingScript.player;
  if (game.pendingBothPlayersSwitch) return game.pendingBothPlayersSwitch.controlledBy;
  if (game.pendingOpponentActiveSwitch) return game.pendingOpponentActiveSwitch.player;
  if (game.pendingKOEnergyMove) return game.pendingKOEnergyMove.player;
  return null;
}

/** Gagnant d'une partie terminée : celui qui a subi le moins de dégâts (0 = égalité). */
export function getWinner(game: GameApi): 0 | 1 | 2 {
  // Abandon : l'autre joueur gagne.
  if (game.forfeitedPlayer) return game.forfeitedPlayer === 1 ? 2 : 1;

  if (game.player1Damage < game.player2Damage) return 1;
  if (game.player2Damage < game.player1Damage) return 2;
  return 0;
}
