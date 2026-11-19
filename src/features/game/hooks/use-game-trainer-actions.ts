import { getPokemonMaxHp, isPlayerScriptPrevented } from '@/features/game/rules';
import {
  describeTrainerTarget,
  hasValidTrainerTarget,
  isGenericTrainerEffect,
} from './cell-press/trainer-effects/generic-trainer-effect';
import type {
  BoardState,
  GameCard,
  PendingBothPlayersSwitch,
  Player,
  SetState,
   PlayerStatusState,
  TrainerCard,
  PendingScript,
} from '@/features/game/types';

type UseGameTrainerActionsOptions = {
  turnId: number;
  setPendingScript: SetState<PendingScript | null>;
  selectedTrainerCard: TrainerCard | null;
  hasAttackedThisTurn: boolean;
  hasUsedSupporterThisTurn: boolean;
  setHasUsedSupporterThisTurn: SetState<boolean>;
  board: BoardState;
  currentPlayer: Player;
  player1Status: PlayerStatusState;
  player2Status: PlayerStatusState;
  setPlayer1Status: SetState<PlayerStatusState>;
  setPlayer2Status: SetState<PlayerStatusState>;
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
  turnId,
  setPendingScript,
  board,
  currentPlayer,
  player1Status,
  player2Status,
  setPlayer1Status,
  setPlayer2Status,
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

    // Code des cartes : Objets / Supporters interdits.
    if (
      isPlayerScriptPrevented(
        currentPlayerStatus,
        board,
        currentPlayer,
        card.category === 'objet' ? 'items' : 'supporters'
      )
    ) {
      setMessage(
        `Joueur ${currentPlayer} : tu ne peux pas jouer de carte ${card.category === 'objet' ? 'Objet' : 'Supporter'} pour le moment (effet en cours).`
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

    // -----------------------------------------
    // BONUS D'ATTAQUE PENDANT CE TOUR (ex : Cynthia)
    // -----------------------------------------
    if (card.effect === 'boostPokemonAttackThisTurn') {
      if (card.category === 'supporter' && hasUsedSupporterThisTurn) {
        setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
        return;
      }

      const bonus = {
        pokemonName: card.boostPokemonName ?? '',
        attackName: card.boostAttackName ?? '',
        amount: card.boostAmount ?? 0,
        sourceName: card.name,
      };

      const setStatus = currentPlayer === 1 ? setPlayer1Status : setPlayer2Status;
      setStatus((status) => ({
        ...status,
        attackBonusesThisTurn: [...(status.attackBonusesThisTurn ?? []), bonus],
      }));

      if (currentPlayer === 1) {
        setPlayer1Hand((hand) => hand.filter((handCard) => handCard.id !== card.id));
        setPlayer1Discard((discard) => [...discard, card]);
      } else {
        setPlayer2Hand((hand) => hand.filter((handCard) => handCard.id !== card.id));
        setPlayer2Discard((discard) => [...discard, card]);
      }

      if (card.category === 'supporter') {
        setHasUsedSupporterThisTurn(true);
      }
      setSelectedTrainerCard(null);
      setTrainerEffectActivated(false);
      setSelectedPokemonCell(null);
      setSelectedAttackIndex(null);
      setMessage(
        `${card.name} : pendant ce tour, l'attaque ${bonus.attackName} de tes ${bonus.pokemonName} inflige ${bonus.amount} dégâts supplémentaires.`
      );
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

    // -----------------------------------------
    // CODE DES CARTES : la carte part à la défausse, puis son script s'applique.
    // -----------------------------------------
    if (card.effect === 'script') {
      if (card.category === 'supporter' && hasUsedSupporterThisTurn) {
        setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
        return;
      }

      if (currentPlayer === 1) {
        setPlayer1Hand((hand) => hand.filter((handCard) => handCard.id !== card.id));
        setPlayer1Discard((discard) => [...discard, card]);
      } else {
        setPlayer2Hand((hand) => hand.filter((handCard) => handCard.id !== card.id));
        setPlayer2Discard((discard) => [...discard, card]);
      }
      if (card.category === 'supporter') setHasUsedSupporterThisTurn(true);

      setSelectedTrainerCard(null);
      setTrainerEffectActivated(false);
      setPendingScript({
        player: currentPlayer,
        sourceName: card.name,
        sourceCell: null,
        trainerCard: card,
        blocks: card.script ?? [],
        index: 0,
        stage: 'run',
        chosenCells: [],
        turnId,
      });
      return;
    }

    // -----------------------------------------
    // CARTES « À RÉGLAGES » (soin, Énergies, avec contraintes)
    // -----------------------------------------
    if (isGenericTrainerEffect(card)) {
      if (card.category === 'supporter' && hasUsedSupporterThisTurn) {
        setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
        return;
      }

      if (!hasValidTrainerTarget(card, board, currentPlayer)) {
        setMessage(
          `${card.name} : aucun de tes Pokémon ne peut recevoir l'effet (${describeTrainerTarget(card)}).`
        );
        return;
      }

      // Avec une pièce : on passe par le bouton « Lancer la pièce ».
      if (card.coinCount) {
        setMessage(`${card.name} : lance d'abord la pièce. FACE = l'effet s'applique.`);
        return;
      }

      setTrainerEffectActivated(true);
      setMessage(`${card.name} : choisis ${describeTrainerTarget(card)}.`);
      return;
    }

    // Flo : soin sur un Pokémon qui a une Énergie d'un type précis.
    if (card.effect === 'healPokemonWithEnergyType') {
      if (hasUsedSupporterThisTurn) {
        setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
        return;
      }

      const energyType = card.healEnergyType;
      const hasTarget = Object.values(board).some(
        (pokemon) =>
          pokemon !== null &&
          pokemon.owner === currentPlayer &&
          !pokemon.isInvocation &&
          (!energyType || pokemon.energies.includes(energyType)) &&
          pokemon.currentHp < getPokemonMaxHp(pokemon)
      );

      if (!hasTarget) {
        setMessage(
          `Aucun de tes Pokémon blessés n'a d'Énergie ${energyType ?? ''} attachée.`
        );
        return;
      }

      setTrainerEffectActivated(true);
      setMessage(
        `Choisis l'un de tes Pokémon avec une Énergie ${energyType ?? ''} pour le soigner de ${card.healAmount ?? 80} PV.`
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
    if (card.effect === 'toolRetreatMinusOneIgnoreConditions') {
      setMessage('Choisis un de tes Pokémon auquel attacher cet Outil.');
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
