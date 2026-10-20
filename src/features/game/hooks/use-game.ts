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
import {getPassiveEnergyLimit,canAttachEnergyFromSource,} from '@/features/game/rules';
import type { EnergyType } from '@/features/game/types';


/**
 * Assemble tous les hooks de la partie.
 *
 * Chaque hook reçoit l'état partagé (`state`) plus les fonctions produites par les hooks
 * précédents ; l'ordre des appels suit donc les dépendances entre eux.
 */
export function useGame() {
  const state = useGameState();

function chooseDragonEnergy(energyType: EnergyType) {
  const pending = state.pendingDragonEnergyChoices[0];

  if (!pending) return;

  const pokemon = state.board[pending.cellName];

  // Si le Pokémon a disparu, abandonner ce choix.
  if (!pokemon || pokemon.owner !== pending.player) {
    state.setPendingDragonEnergyChoices(
      (previous) => previous.slice(1)
    );
    return;
  }

  // Vérifie si le Pokémon Dragon peut recevoir
  // une énergie considérée comme venant de la main.
  if (!canAttachEnergyFromSource(pokemon, 'hand')) {
    state.setMessage(
      `${pokemon.card.name} ne peut pas recevoir d'Énergie à cause de l'attaque adverse.`
    );

    // Supprime ce choix devenu interdit.
    state.setPendingDragonEnergyChoices(
      (previous) => previous.slice(1)
    );

    return;
  }

  const allowedTypes = pokemon.card.dragonEnergyTypes;

  // Vérifier que l'énergie choisie fait partie
  // des deux types autorisés pour ce Dragon.
  if (!allowedTypes?.includes(energyType)) {
    return;
  }

  const passiveEnergyLimit =
    getPassiveEnergyLimit(pokemon.card);

  if (pokemon.energies.length < passiveEnergyLimit) {
    state.setBoard((previousBoard) => {
      const currentPokemon = previousBoard[pending.cellName];

      
if (
  !currentPokemon ||
  currentPokemon.owner !== pending.player ||
  !canAttachEnergyFromSource(currentPokemon, 'hand') ||
  currentPokemon.energies.length >=
    getPassiveEnergyLimit(currentPokemon.card)
) {
  return previousBoard;
}


      return {
        ...previousBoard,
        [pending.cellName]: {
          ...currentPokemon,
          energies: [
            ...currentPokemon.energies,
            energyType,
          ],
        },
      };
    });

    state.setMessage(
      `${pokemon.card.name} reçoit une Énergie ${energyType}.`
    );
  }

  // Passer au choix suivant ou terminer.
  state.setPendingDragonEnergyChoices((previous) => {
    const [current, ...rest] = previous;

    if (!current) return previous;

    return current.remaining > 1
      ? [
          { ...current, remaining: current.remaining - 1 },
          ...rest,
        ]
      : rest;
  });
}

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
    ...attackResolution,
    ...retreat,
    ...turn,
    ...restart,
    ...cellPress,
    ...screenActions,
    chooseDragonEnergy,
  };
}

/** Tout ce que renvoie `useGame` : l'état de la partie et les actions du joueur. */
export type GameApi = ReturnType<typeof useGame>;
