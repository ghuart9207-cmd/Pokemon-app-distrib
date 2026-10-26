import { getPokemonMaxHp } from '@/features/game/rules';
import type {
  BoardState,
  GameCard,
  PendingBothPlayersSwitch,
  Player,
  SetState,
   PlayerStatusState,
  TrainerCard,
} from '@/features/game/types';

type UseGameTrainerActionsOptions = {
  selectedTrainerCard: TrainerCard | null;
  hasAttackedThisTurn: boolean;
  hasUsedSupporterThisTurn: boolean;
  setHasUsedSupporterThisTurn: SetState<boolean>;
  board: BoardState;
  currentPlayer: Player;
  player1Status: PlayerStatusState;
  player2Status: PlayerStatusState;
  player1Hand: GameCard[];
  player2Hand: GameCard[];
  setPlayer1Hand: SetState<GameCard[]>;
  setPlayer2Hand: SetState<GameCard[]>;
  setPlayer1Discard: SetState<GameCard[]>;
  setPlayer2Discard: SetState<GameCard[]>;
  setBoard: SetState<BoardState>;
  setMessage: SetState<string>;
  setSelectedTrainerCard: SetState<TrainerCard | null>;
  setSelectedPokemonCell: SetState<string | null>;
  setSelectedAttackIndex: SetState<number | null>;
  setSelectedAttachedTool: SetState<{
    card: TrainerCard;
    cellName: string;
  } | null>;
  setTrainerEffectActivated: SetState<boolean>;
  setPendingBothPlayersSwitch: SetState<PendingBothPlayersSwitch | null>;
  playerCanSwitchHorizontally: (board: BoardState, player: Player) => boolean;
};

export function useGameTrainerActions({
  selectedTrainerCard,
  hasAttackedThisTurn,
  hasUsedSupporterThisTurn,
  setHasUsedSupporterThisTurn,
  board,
  currentPlayer,
  player1Status,
  player2Status,
  player1Hand,
  player2Hand,
  setPlayer1Hand,
  setPlayer2Hand,
  setPlayer1Discard,
  setPlayer2Discard,
  setBoard,
  setMessage,
  setSelectedTrainerCard,
  setSelectedPokemonCell,
  setSelectedAttackIndex,
  setSelectedAttachedTool,
  setTrainerEffectActivated,
  setPendingBothPlayersSwitch,
  playerCanSwitchHorizontally,
}: UseGameTrainerActionsOptions) {
  function activateSelectedTrainerCard() {
    const card = selectedTrainerCard;
    if (!card) {
      return;
    }

    // -----------------------------------------
// INTERDICTION TEMPORAIRE DES CARTES OBJET
// -----------------------------------------

const currentPlayerStatus =
  currentPlayer === 1 ? player1Status : player2Status;

if (
  card.category === 'objet' &&
  currentPlayerStatus.itemsBlockedThisTurn
) {
  setMessage(
    `Joueur ${currentPlayer} : tu ne peux pas jouer de carte Objet pendant ce tour à cause de l'attaque adverse.`
  );
  return;
}

    if (hasAttackedThisTurn) {
      setMessage('Tu ne peux plus jouer de carte Dresseur après avoir attaqué.');
      return;
    }

    if (card.effect === 'healWaterEnergy50') {
      if (hasUsedSupporterThisTurn) {
        setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
        return;
      }

      const pokemonToHeal = Object.entries(board).filter(
        ([, pokemon]) =>
          pokemon !== null &&
          pokemon.owner === currentPlayer &&
          pokemon.energies.includes('eau') &&
          !pokemon.healBlockedEndPlayer &&
          pokemon.currentHp < getPokemonMaxHp(pokemon)
      );

      if (pokemonToHeal.length === 0) {
        setMessage(
          'Aucun de tes Pokémon avec une Énergie Eau attachée n’a de dégâts à soigner.'
        );
        return;
      }

      const newBoard: BoardState = { ...board };
      const healedPokemonNames: string[] = [];

      pokemonToHeal.forEach(([cellName, pokemon]) => {
        if (!pokemon) {
          return;
        }

        const newHp = Math.min(pokemon.currentHp + 50, getPokemonMaxHp(pokemon));
        healedPokemonNames.push(
          `${pokemon.card.name} (+${newHp - pokemon.currentHp} PV)`
        );
        newBoard[cellName] = { ...pokemon, currentHp: newHp };
      });

      setBoard(newBoard);
      if (currentPlayer === 1) {
        setPlayer1Hand((hand) => hand.filter((handCard) => handCard.id !== card.id));
        setPlayer1Discard((discard) => [...discard, card]);
      } else {
        setPlayer2Hand((hand) => hand.filter((handCard) => handCard.id !== card.id));
        setPlayer2Discard((discard) => [...discard, card]);
      }

      setHasUsedSupporterThisTurn(true);
      setSelectedTrainerCard(null);
      setTrainerEffectActivated(false);
      setSelectedPokemonCell(null);
      setSelectedAttackIndex(null);
      setMessage(`Soin Aquatique : ${healedPokemonNames.join(', ')}.`);
      return;
    }

    if (card.effect === 'attach2FireEndTurn') {
      if (hasUsedSupporterThisTurn) {
        setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
        return;
      }

      const hasFirePokemon = Object.values(board).some(
        (pokemon) =>
          pokemon !== null &&
          pokemon.owner === currentPlayer &&
          pokemon.card.type === 'feu'
      );

      if (!hasFirePokemon) {
        setMessage('Tu n’as aucun Pokémon de type Feu en jeu.');
        return;
      }

      setTrainerEffectActivated(true);
      setMessage(
        'Choisis l’un de tes Pokémon de type Feu pour lui ajouter 2 Énergies Feu.'
      );
      return;
    }

    if (card.effect === 'forceOpponentThenSelfSwitch') {
      if (hasUsedSupporterThisTurn) {
        setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
        return;
      }

      const opponent: Player = currentPlayer === 1 ? 2 : 1;
      const opponentCanSwitch = playerCanSwitchHorizontally(board, opponent);
      const currentPlayerCanSwitch = playerCanSwitchHorizontally(board, currentPlayer);

      // Utilisable dès qu'au moins un des deux joueurs peut échanger
      // (les Invocations ne comptent pas : une carte Dresseur ne peut pas les cibler).
      if (!opponentCanSwitch && !currentPlayerCanSwitch) {
        setMessage(
          'Aucun des deux joueurs ne possède deux Pokémon pouvant être échangés sur une même ligne (les Invocations ne comptent pas).'
        );
        return;
      }

      setPendingBothPlayersSwitch({
        card,
        playedBy: currentPlayer,
        // L'adversaire d'abord si possible, sinon directement le joueur.
        choosingPlayer: opponentCanSwitch ? opponent : currentPlayer,
        controlledBy: currentPlayer,
        firstCell: null,
      });
      setTrainerEffectActivated(true);
      setMessage(
        opponentCanSwitch
          ? `Joueur ${currentPlayer} : choisis le premier Pokémon du joueur ${opponent} que tu veux échanger.`
          : `Le joueur ${opponent} ne peut pas échanger. Joueur ${currentPlayer}, choisis ton premier Pokémon à échanger.`
      );
      return;
    }

    if (card.effect === 'bothPlayersSwitch') {
      const opponent: Player = currentPlayer === 1 ? 2 : 1;
      const opponentCanSwitch = playerCanSwitchHorizontally(board, opponent);
      const currentPlayerCanSwitch = playerCanSwitchHorizontally(board, currentPlayer);

      if (!opponentCanSwitch && !currentPlayerCanSwitch) {
        setMessage('Aucun des deux joueurs ne possède deux Pokémon pouvant échanger.');
        return;
      }

      const firstPlayer: Player = opponentCanSwitch ? opponent : currentPlayer;
      setPendingBothPlayersSwitch({
        card,
        playedBy: currentPlayer,
        choosingPlayer: firstPlayer,
        controlledBy: firstPlayer,
        firstCell: null,
      });
      setTrainerEffectActivated(true);
      setSelectedPokemonCell(null);
      setSelectedAttackIndex(null);
      setSelectedAttachedTool(null);
      setMessage(
        opponentCanSwitch
          ? `Carte activée ! Le joueur ${opponent} échange en premier. Choisis son premier Pokémon.`
          : `Le joueur ${opponent} ne peut pas échanger. Joueur ${currentPlayer}, choisis ton premier Pokémon.`
      );
      return;
    }

    setTrainerEffectActivated(true);
    if (card.effect === 'heal30' || card.effect === 'heal20') {
      setMessage('Choisis un de tes Pokémon à soigner.');
      return;
    }
    if (card.effect === 'toolHp40') {
      setMessage('Choisis un Pokémon de Niveau 1 auquel attacher cet Outil.');
      return;
    }
    if (card.effect === 'returnPokemonToHand') {
      setMessage('Choisis un de tes Pokémon à remettre dans ta main.');
      return;
    }
    setMessage(`${card.name} est activée.`);
  }

  return { activateSelectedTrainerCard };
}
