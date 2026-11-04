import { useEffect, useRef } from 'react';

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
import type { CardSeries, EnergyType } from '@/features/game/types';
import { CARD_SERIES, DEFAULT_CARD_SERIES } from '@/features/game/data';


/**
 * Assemble tous les hooks de la partie.
 *
 * Chaque hook reçoit l'état partagé (`state`) plus les fonctions produites par les hooks
 * précédents ; l'ordre des appels suit donc les dépendances entre eux.
 */
export function useGame(series: CardSeries = DEFAULT_CARD_SERIES) {
  const state = useGameState();

  // Série de cartes de la partie : les deux joueurs choisissent
  // uniquement parmi les cartes de cette série.
  const cardSeries = CARD_SERIES[series];

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
  const setup = useGameSetup({ ...state, cardSeries });

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
  const screenActions = useGameScreenActions({
    ...state,
    ...turn,
    setupPhase: setup.setupPhase,
  });

  // -----------------------------------------
  // ANNULER LE TOUR
  // Au début de chaque tour, on garde une copie de tout l'état de la partie.
  // « Annuler le tour » remet cette copie : toutes les actions du tour
  // (celles du joueur ET de son adversaire pendant ce tour) sont effacées.
  // -----------------------------------------
  const turnSnapshotRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (setup.setupPhase !== 'battle') {
      turnSnapshotRef.current = null;
      return;
    }

    turnSnapshotRef.current = captureStateSnapshot(state);
    // Une copie par tour : seulement quand le tour change (ou au début du combat).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.turnId, setup.setupPhase]);

  function undoTurn() {
    if (setup.setupPhase !== 'battle' || state.gameOver) return;

    const snapshot = turnSnapshotRef.current;

    if (!snapshot || snapshot.turnId !== state.turnId) {
      state.setMessage("Impossible d'annuler ce tour.");
      return;
    }

    restoreStateSnapshot(state, snapshot);
    attackResolution.clearAttackPrompts();
    state.setMessage(
      `↩️ Joueur ${state.currentPlayer} annule son tour : tout revient comme au début du tour.`
    );
  }

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
    undoTurn,
    cardSeries,
  };
}

/** Tout ce que renvoie `useGame` : l'état de la partie et les actions du joueur. */
export type GameApi = ReturnType<typeof useGame>;

/**
 * Copie de tout l'état de `useGameState` : chaque valeur qui a son setter
 * (`board` / `setBoard`, `round` / `setRound`, …).
 */
function captureStateSnapshot(state: Record<string, unknown>): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};

  for (const key of Object.keys(state)) {
    if (key.startsWith('set')) continue;

    const setterName = `set${key[0].toUpperCase()}${key.slice(1)}`;
    if (typeof state[setterName] === 'function') {
      snapshot[key] = state[key];
    }
  }

  return snapshot;
}

/** Remet l'état copié par `captureStateSnapshot`. */
function restoreStateSnapshot(state: Record<string, unknown>, snapshot: Record<string, unknown>) {
  for (const [key, value] of Object.entries(snapshot)) {
    const setter = state[`set${key[0].toUpperCase()}${key.slice(1)}`];
    if (typeof setter === 'function') {
      // La fonction est passée telle quelle si la valeur en est une (cas improbable).
      (setter as (next: unknown) => void)(typeof value === 'function' ? () => value : value);
    }
  }
}
