import { useGameState } from './state/use-game-state';
import { useGameAttackResolution } from './use-game-attack-resolution';
import { useGameAttackSelection } from './use-game-attack-selection';
import { useGameCellInteractions } from './use-game-cell-interactions';
import { useGameCoinFlow } from './use-game-coin-flow';
import { useGameCombatSupport } from './use-game-combat-support';
import { useGameInvocation } from './use-game-invocation';
import { useGameMovement } from './use-game-movement';
import { useGameRestart } from './use-game-restart';
import { useGameRetreat } from './use-game-retreat';
import { useGameScreenActions } from './use-game-screen-actions';
import { useGameSelection } from './use-game-selection';
import { useGameSetup } from './use-game-setup';
import { useGameTargeting } from './use-game-targeting';
import { useGameTrainerActions } from './use-game-trainer-actions';
import { useGameTurn } from './use-game-turn';

/**
 * Assemble tous les hooks de la partie.
 *
 * Chaque hook reçoit l'état partagé (`state`) plus les fonctions produites par les hooks
 * précédents ; l'ordre des appels suit donc les dépendances entre eux.
 */
export function useGame() {
  const state = useGameState();

  // Préparation de la partie
  const setup = useGameSetup(state);

  // Règles de déplacement, de ciblage et de sélection
  const movement = useGameMovement(state);
  const targeting = useGameTargeting(state);
  const selection = useGameSelection(state);

  // Pile ou face, cartes Dresseur et invocations
  const coinFlow = useGameCoinFlow(state);
  const trainerActions = useGameTrainerActions({ ...state, ...movement });
  const invocation = useGameInvocation({ ...state, ...setup });

  // Combat
  const combat = useGameCombatSupport({ ...state, ...coinFlow });
  const attackResolution = useGameAttackResolution({
    ...state,
    ...movement,
    ...targeting,
    ...coinFlow,
    ...combat,
  });
  const attackSelection = useGameAttackSelection({
    ...state,
    ...movement,
    ...coinFlow,
    ...attackResolution,
  });
  const retreat = useGameRetreat(state);

  // Tour, redémarrage et clics sur le plateau
  const turn = useGameTurn({ ...state, ...combat });
  const restart = useGameRestart({ ...state, ...setup });
  const cellPress = useGameCellInteractions({
    ...state,
    ...movement,
    ...combat,
    ...turn,
  });

  // Handlers de l'écran de jeu
  const screenActions = useGameScreenActions({ ...state, ...turn });

  return {
    ...state,
    ...setup,
    ...targeting,
    ...selection,
    ...coinFlow,
    ...trainerActions,
    ...invocation,
    ...attackSelection,
    ...retreat,
    ...turn,
    ...restart,
    ...cellPress,
    ...screenActions,
  };
}
