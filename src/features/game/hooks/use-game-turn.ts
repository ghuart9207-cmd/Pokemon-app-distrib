import {
  advancePlayerExtraDamage,
  getKnockoutConsequences,
  resolvePlayerEndOfTurnStatus,
  resolvePokemonEndOfTurn,
  getPassiveEnergyLimit,
} from '@/features/game/rules';
import type {
  AttackPath,
  BoardState,
  EnergyType,
  GameCard,
  Player,
  PlayerStatusState,
  PokemonCard,
  PokemonInPlay,
  SetState,
  TrainerCard,
  PendingDragonEnergyChoice,
} from '@/features/game/types';

type UseGameTurnOptions = {
  board: BoardState;
  currentPlayer: Player;
  gameOver: boolean;
  player1Damage: number;
  player2Damage: number;
  player1Status: PlayerStatusState;
  player2Status: PlayerStatusState;
  round: number;
  setBoard: SetState<BoardState>;
  setCurrentPlayer: SetState<Player>;
  setGameOver: SetState<boolean>;
  setHasAttackedThisTurn: SetState<boolean>;
  setHasPlacedThisTurn: SetState<boolean>;
  setHasUsedSupporterThisTurn: SetState<boolean>;
  setMessage: SetState<string>;
  setPlayer1Damage: SetState<number>;
  setPlayer2Damage: SetState<number>;
  setPlayer1Discard: SetState<GameCard[]>;
  setPlayer2Discard: SetState<GameCard[]>;
  setPlayer1DiscardEnergies: SetState<EnergyType[]>;
  setPlayer2DiscardEnergies: SetState<EnergyType[]>;
  setPlayer1Status: SetState<PlayerStatusState>;
  setPlayer2Status: SetState<PlayerStatusState>;
  pendingDragonEnergyChoices: PendingDragonEnergyChoice[];
  setPendingDragonEnergyChoices:
  SetState<PendingDragonEnergyChoice[]>;
  setRemainingAttackPaths: SetState<AttackPath[]>;
  setRound: SetState<number>;
  setSelectedAttackIndex: SetState<number | null>;
  setSelectedCard: SetState<PokemonCard | null>;
  setSelectedPokemonCell: SetState<string | null>;
  setSelectedTrainerCard: SetState<TrainerCard | null>;
  setTrainerEffectActivated: SetState<boolean>;
  setTurnId: SetState<number>;
  prepareKOEnergyMove: (pokemon: PokemonInPlay, board: BoardState) => boolean;
};

export function useGameTurn(options: UseGameTurnOptions) {
  function endTurn(boardOverride?: BoardState) {
    if (options.gameOver) {
      return;
    }

    
if (options.pendingDragonEnergyChoices.length > 0) {
  options.setMessage(
    "Termine d'abord les choix d'Énergie de tes Pokémon Dragon."
  );
  return;
}


    const playerReceivingEnergy: Player = options.currentPlayer === 1 ? 2 : 1;
    const newBoard: BoardState = { ...(boardOverride ?? options.board) };
    
    const dragonEnergyChoices: PendingDragonEnergyChoice[] = [];

    const koPlayer1: PokemonInPlay[] = [];
    const koPlayer2: PokemonInPlay[] = [];

    Object.keys(newBoard).forEach((cellName) => {
      const currentPokemon = newBoard[cellName];
      if (!currentPokemon) {
        return;
      }

      const pokemon = resolvePokemonEndOfTurn(
        currentPokemon,
        options.currentPlayer,
        playerReceivingEnergy
      );

      if (pokemon.currentHp <= 0) {
        newBoard[cellName] = null;
        options.prepareKOEnergyMove(pokemon, newBoard);
        if (pokemon.owner === 1) {
          koPlayer1.push(pokemon);
        } else {
          koPlayer2.push(pokemon);
        }
        return;
      }

      newBoard[cellName] = pokemon;
      
if (
  pokemon.owner === playerReceivingEnergy &&
  pokemon.card.type === 'dragon' &&
  pokemon.card.dragonEnergyTypes?.length === 2 &&
  pokemon.energies.length < getPassiveEnergyLimit(pokemon.card)
) {
  dragonEnergyChoices.push({
    cellName,
    player: pokemon.owner,
    remaining: 1,
  });
}

    });
    
options.setPendingDragonEnergyChoices(dragonEnergyChoices);


    options.setBoard(newBoard);

    const player1TurnStatus = resolvePlayerEndOfTurnStatus(
      options.player1Status,
      options.currentPlayer
    );
    options.setPlayer1Status(player1TurnStatus.status);
    if (player1TurnStatus.damage > 0) {
      options.setPlayer1Damage((damage) => damage + player1TurnStatus.damage);
    }

    const player2TurnStatus = resolvePlayerEndOfTurnStatus(
      options.player2Status,
      options.currentPlayer
    );
    options.setPlayer2Status(player2TurnStatus.status);
    if (player2TurnStatus.damage > 0) {
      options.setPlayer2Damage((damage) => damage + player2TurnStatus.damage);
    }

    if (koPlayer1.length > 0) {
      const consequences = getKnockoutConsequences(koPlayer1);
      options.setPlayer1Damage((damage) => damage + consequences.penalty);
      options.setPlayer1Discard((discard) => [
        ...discard,
        ...consequences.discardedCards,
      ]);
      options.setPlayer1DiscardEnergies((discard) => [
        ...discard,
        ...consequences.discardedEnergies,
      ]);
    }

    if (koPlayer2.length > 0) {
      const consequences = getKnockoutConsequences(koPlayer2);
      options.setPlayer2Damage((damage) => damage + consequences.penalty);
      options.setPlayer2Discard((discard) => [
        ...discard,
        ...consequences.discardedCards,
      ]);
      options.setPlayer2DiscardEnergies((discard) => [
        ...discard,
        ...consequences.discardedEnergies,
      ]);
    }

    options.setPlayer1Status((status) =>
      advancePlayerExtraDamage(status, options.currentPlayer)
    );
    options.setPlayer2Status((status) =>
      advancePlayerExtraDamage(status, options.currentPlayer)
    );

    options.setSelectedCard(null);
    options.setSelectedPokemonCell(null);
    options.setSelectedTrainerCard(null);
    options.setTrainerEffectActivated(false);
    options.setHasPlacedThisTurn(false);
    options.setHasUsedSupporterThisTurn(false);
    options.setSelectedAttackIndex(null);
    options.setHasAttackedThisTurn(false);
    options.setRemainingAttackPaths([]);

    if (options.currentPlayer === 1) {
      options.setTurnId((previous) => previous + 1);
      options.setCurrentPlayer(2);
      options.setMessage(`Tour du joueur 2 — Manche ${options.round}/8`);
      return;
    }

    if (options.round === 8) {
      options.setGameOver(true);
      if (options.player1Damage < options.player2Damage) {
        options.setMessage(
          `🏆 Joueur 1 gagne : ${options.player1Damage} dégâts contre ${options.player2Damage}.`
        );
      } else if (options.player2Damage < options.player1Damage) {
        options.setMessage(
          `🏆 Joueur 2 gagne : ${options.player2Damage} dégâts contre ${options.player1Damage}.`
        );
      } else {
        options.setMessage(`Égalité : ${options.player1Damage} dégâts chacun.`);
      }
      return;
    }

    const nextRound = options.round + 1;
    options.setTurnId((previous) => previous + 1);
    options.setRound(nextRound);
    options.setCurrentPlayer(1);
    options.setMessage(`Manche ${nextRound}/8 — Tour du joueur 1`);
  }

  return { endTurn };
}
