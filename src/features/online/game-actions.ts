import { ALL_POKEMON_CARDS, ALL_TRAINER_CARDS } from '@/features/game/data';
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

const CATALOG: GameCard[] = [...ALL_POKEMON_CARDS, ...ALL_TRAINER_CARDS];

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

    // Nouvelle partie
    restartGame: () => send('restart', []),
    restartSameCards: () => send('restartSame', []),

    // Préparation des cartes et des invocations
    toggleSetupCard: (card: GameCard) => send('setupToggle', [card.id]),
    confirmSetupSelection: () => send('setupConfirm', []),
    addInvocationSetupCard: (card: PokemonCard) => send('invAdd', [card.id]),
    removeInvocationSetupCard: (index: number) => send('invRemove', [index]),
    confirmInvocationSetup: () => send('invConfirm', []),
  };
}

/**
 * Applique sur CE jeu une action reçue du serveur (qu'elle vienne de moi ou de l'adversaire).
 * `game` doit être le jeu local d'origine, pas la version qui envoie au serveur.
 */
export function applyAction(action: OnlineAction, game: GameApi): void {
  const [first, second, third] = action.payload;

  switch (action.name) {
    case 'cell':
      return game.handleCellPress(String(first));
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

    case 'restart':
      return game.restartGame();
    case 'restartSame':
      return game.restartSameCards();

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

  return [...seats];
}

/** Gagnant d'une partie terminée : celui qui a subi le moins de dégâts (0 = égalité). */
export function getWinner(game: GameApi): 0 | 1 | 2 {
  if (game.player1Damage < game.player2Damage) return 1;
  if (game.player2Damage < game.player1Damage) return 2;
  return 0;
}
