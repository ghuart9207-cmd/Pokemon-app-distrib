import type { BoardState, EnergyType, Player, SetState } from '@/features/game/types';
import { getEffectiveRetreatCost } from '@/features/game/rules/retreat-cost-rules';

type UseGameRetreatOptions = {
  board: BoardState;
  currentPlayer: Player;
  selectedPokemonCell: string | null;
  round: number;
  turnId: number;
  setMessage: SetState<string>;
  setBoard: SetState<BoardState>;
  setSelectedPokemonCell: SetState<string | null>;
  setPlayer1DiscardEnergies: SetState<EnergyType[]>;
  setPlayer2DiscardEnergies: SetState<EnergyType[]>;
};

export function useGameRetreat({
  board,
  currentPlayer,
  round,
  turnId,
  selectedPokemonCell,
  setMessage,
  setBoard,
  setSelectedPokemonCell,
  setPlayer1DiscardEnergies,
  setPlayer2DiscardEnergies,
}: UseGameRetreatOptions) {
  function retreatSelectedPokemon() {
    if (!selectedPokemonCell) {
      return;
    }

    const pokemon = board[selectedPokemonCell];
    if (!pokemon) {
      return;
    }

    if (pokemon.asleep) {
      setMessage(`${pokemon.card.name} est endormi et ne peut pas battre en retraite.`);
      return;
    }

    if (pokemon.owner !== currentPlayer) {
      setMessage("Ce Pokémon ne t'appartient pas.");
      return;
    }


    if (pokemon.retreatBlockedUntilOwnTurnEnd) {
  setMessage(
    `${pokemon.card.name} ne peut pas battre en retraite pendant ce tour à cause de l'attaque adverse.`
  );
  return;
}


    if (pokemon.paralyzed) {
      setMessage(`${pokemon.card.name} est paralysé et ne peut pas battre en retraite.`);
      return;
    }

    if (pokemon.hasAttacked) {
      setMessage(
        `${pokemon.card.name} a déjà attaqué pendant ce tour et ne peut donc plus battre en retraite.`
      );
      return;
    }

    if (pokemon.hasRetreated) {
      setMessage(`${pokemon.card.name} a déjà utilisé sa retraite pendant cette partie.`);
      return;
    }

    const row = selectedPokemonCell[0];
    const column = selectedPokemonCell[1];
    let destinationCell: string;

    if (pokemon.owner === 1) {
      if (row !== 'B') {
        setMessage('Le joueur 1 peut uniquement battre en retraite de B vers A.');
        return;
      }
      destinationCell = `A${column}`;
    } else {
      if (row !== 'C') {
        setMessage('Le joueur 2 peut uniquement battre en retraite de C vers D.');
        return;
      }
      destinationCell = `D${column}`;
    }

    if (board[destinationCell]) {
      setMessage(`Impossible : la case ${destinationCell} est déjà occupée.`);
      return;
    }

// Calcul du coût de retraite avec les Talents.
const retreatCost = getEffectiveRetreatCost(
  pokemon,
  round,
  turnId
);

   if (pokemon.energies.length < retreatCost) {
      setMessage(
        `${pokemon.card.name} n'a pas assez d'Énergies pour battre en retraite.`
      );
      return;
    }

    
const discardedEnergies =
  pokemon.energies.slice(0, retreatCost);

const remainingEnergies =
  pokemon.energies.slice(retreatCost);


    if (pokemon.owner === 1) {
      setPlayer1DiscardEnergies((previous) => [...previous, ...discardedEnergies]);
    } else {
      setPlayer2DiscardEnergies((previous) => [...previous, ...discardedEnergies]);
    }

    const newBoard: BoardState = { ...board };
    newBoard[selectedPokemonCell] = null;
    newBoard[destinationCell] = {
      ...pokemon,
      energies: remainingEnergies,
      hasRetreated: true,
    };
    setBoard(newBoard);
    setSelectedPokemonCell(destinationCell);
    setMessage(
      `${pokemon.card.name} bat en retraite de ${selectedPokemonCell} vers ${destinationCell}.`
    );
  }

  return { retreatSelectedPokemon };
}
