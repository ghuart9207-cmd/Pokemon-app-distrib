import type { PendingKOEnergyMove, Player, PokemonInPlay, GameCard, PendingDiscardTalentPlacement,  } from '@/features/game/types';
import type { GameState } from './state/use-game-state';
import { isPokemonCard } from '@/features/game/rules';
import { applyKOEnergyMove } from './cell-press/apply-ko-energy-move';

type GameScreenActionsOptions = Pick<
  GameState,
  | 'board'
  | 'player1Discard'
  | 'player2Discard'
  | 'openedDiscardPlayer'
  | 'selectedPokemonCell'
  | 'selectedAttachedTool'
  | 'setOpenedDiscardPlayer'
  | 'setSelectedAttachedTool'
  | 'setSelectedPokemonCell'
  | 'setSelectedAttackIndex'
  | 'setPendingKOEnergyMove'
  | 'pendingKOEnergyMove'
  | 'setBoard'
  | 'setPlayer1DiscardEnergies'
  | 'setPlayer2DiscardEnergies'
  | 'setPendingInvocationPlacement'
  | 'setMessage'
  | 'currentPlayer'
  | 'turnId'
  | 'setPendingTalentEnergyAttachment'
  | 'gameOver'
  | 'player1DiscardEnergies'
  | 'player2DiscardEnergies'
  | 'pendingDiscardTalentPlacement'
  | 'usedDiscardTalentKeys'
  | 'setPendingDiscardTalentPlacement'
  | 'setUsedDiscardTalentKeys'
  | 'setSelectedCard'
  | 'setSelectedTrainerCard'
  | 'setSelectedPokemonCell'
  | 'setSelectedAttackIndex'
> & {
  endTurn: () => void;
};

/** Petits handlers qui relient les composants de l'écran de jeu à l'état. */
export function useGameScreenActions({
  board,
  player1Discard,
  player2Discard,
  openedDiscardPlayer,
  selectedPokemonCell,
  selectedAttachedTool,
  setOpenedDiscardPlayer,
  setSelectedAttachedTool,
  setSelectedPokemonCell,
  setSelectedAttackIndex,
  setPendingKOEnergyMove,
  pendingKOEnergyMove,
  setBoard,
  setPlayer1DiscardEnergies,
  setPlayer2DiscardEnergies,
  setPendingInvocationPlacement,
  setMessage,
  currentPlayer,
  turnId,
  setPendingTalentEnergyAttachment,
  endTurn,
  gameOver,
  player1DiscardEnergies,
  player2DiscardEnergies,
  pendingDiscardTalentPlacement,
  usedDiscardTalentKeys,
  setPendingDiscardTalentPlacement,
  setUsedDiscardTalentKeys,
  setSelectedCard,
  setSelectedTrainerCard,
}: GameScreenActionsOptions) {
  const selectedPokemon = selectedPokemonCell ? board[selectedPokemonCell] : null;
  const openedDiscardCards = openedDiscardPlayer === 1 ? player1Discard : player2Discard;

  function handleToggleDiscard(player: Player) {
    setOpenedDiscardPlayer((previous) => (previous === player ? null : player));
  }

  function handleCloseDiscardPreview() {
    setOpenedDiscardPlayer(null);
  }

  function handleDiscardCardPress(
  card: GameCard,
  index: number,
  player: Player
) {
  // Ce Talent ne concerne que les Pokémon qui le possèdent.
  if (
    !isPokemonCard(card) ||
    card.talent?.effect !== 'recoverFromDiscardOncePerGame'
  ) {
    return;
  }

  if (gameOver) {
    setMessage("La partie est terminée.");
    return;
  }

  if (player !== currentPlayer || openedDiscardPlayer !== currentPlayer) {
    setMessage("Tu peux uniquement utiliser ce Talent depuis ta propre défausse pendant ton tour.");
    return;
  }

  if (pendingDiscardTalentPlacement) {
    setMessage("Choisis d'abord la case où placer le Pokémon déjà sélectionné.");
    return;
  }

  const discard = player === 1 ? player1Discard : player2Discard;

  // Vérifier que la carte est toujours à cette position.
  const discardIndex =
    discard[index] === card
      ? index
      : discard.findIndex((discardCard) => discardCard === card);

  if (discardIndex === -1) {
    setMessage("Ce Pokémon n'est plus dans la défausse.");
    return;
  }

  const usedKey = `${player}:${card.id}`;

  if (usedDiscardTalentKeys.includes(usedKey)) {
    setMessage(`${card.name} a déjà utilisé ce Talent pendant cette partie.`);
    return;
  }

  // Joueur 1 : B1-B4. Joueur 2 : C1-C4.
const allowedRow = player === 1 ? 'B' : 'C';

const hasFreeBoardSpace = [1, 2, 3, 4].some(
  (column) => !board[`${allowedRow}${column}`]
);

if (!hasFreeBoardSpace) {
  setMessage(
    `Aucune case libre sur la rangée ${allowedRow}. Libère une case avant d'utiliser ce Talent.`
  );
  return;
}

  const discardEnergies =
    player === 1 ? player1DiscardEnergies : player2DiscardEnergies;

  const hasDarkEnergy = discardEnergies.includes('obscurite');

  setPendingDiscardTalentPlacement({
    player,
    card,
    discardIndex,
  });

  // Éviter qu'une carte sélectionnée ailleurs perturbe le placement.
  setSelectedCard(null);
  setSelectedTrainerCard(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    hasDarkEnergy
      ? `${card.name} : choisis une case vide de ton banc. Une Énergie Obscurité de ta défausse lui sera attachée.`
      : `${card.name} : choisis une case vide de ton banc. Aucune Énergie Obscurité n'est disponible dans ta défausse.`
  );
}

  /** Sélectionne (ou désélectionne) l'Outil attaché à un Pokémon pour l'afficher. */
  function handleToolPress(cellName: string, pokemon: PokemonInPlay) {
    const tool = pokemon.attachedTool;

    if (!tool) return;

    if (selectedAttachedTool?.cellName === cellName) {
      setSelectedAttachedTool(null);
      return;
    }

    setSelectedAttachedTool({ card: tool, cellName });
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
  }

  function handleSelectKOEnergy(energy: PendingKOEnergyMove['selectedEnergy']) {
    // Relais Optimiste : la cible est déjà choisie,
    // la deuxième Énergie lui est attachée tout de suite.
    if (pendingKOEnergyMove?.targetCell && energy) {
      applyKOEnergyMove(
        {
          board,
          setBoard,
          setMessage,
          setPendingKOEnergyMove,
          setPlayer1DiscardEnergies,
          setPlayer2DiscardEnergies,
        },
        pendingKOEnergyMove,
        energy,
        pendingKOEnergyMove.targetCell
      );
      return;
    }

    setPendingKOEnergyMove((previous) =>
      previous ? { ...previous, selectedEnergy: energy } : null
    );
  }

  function handleSelectInvocation(index: number) {
    setPendingInvocationPlacement((previous) =>
      previous ? { ...previous, selectedIndex: index } : null
    );
  }

  function handleSelectAttack(index: number, attackMessage: string) {
    setSelectedAttackIndex(index);
    setMessage(attackMessage);
  }

  function handleActivateTalent() {
    if (!selectedPokemon || !selectedPokemonCell) {
      setMessage('Sélectionne d’abord un Pokémon.');
      return;
    }

    const talent = selectedPokemon.card.talent;

    if (
      selectedPokemon.owner !== currentPlayer ||
      !talent ||
      talent.type !== 'activated' ||
      talent.effect !== 'attachEnergyOncePerTurn' ||
      !talent.energyType
    ) {
      setMessage("Ce Pokémon ne possède pas ce Talent activable.");
      return;
    }

    if (selectedPokemon.lastUsedTalentTurnId === turnId) {
      setMessage('Ce Pokémon a déjà utilisé son Talent pendant ce tour.');
      return;
    }

    setPendingTalentEnergyAttachment({
      player: currentPlayer,
      sourceCell: selectedPokemonCell,
      energyType: talent.energyType,
      amount: talent.amount ?? 1,
      targetPokemonType: talent.targetPokemonType,
      turnId,
    });

    setMessage(
      `Talent de ${selectedPokemon.card.name} : choisis un de tes Pokémon pour recevoir une Énergie ${talent.energyType}.`
    );
  }

  // `endTurn` est enveloppé pour ne pas recevoir l'événement de clic en argument.
  function handleEndTurn() {
  if (pendingDiscardTalentPlacement) {
    setMessage("Choisis d'abord une case vide de ton banc pour terminer le Talent.");
    return;
  }

  endTurn();
}

  return {
    selectedPokemon,
    openedDiscardCards,
    handleToggleDiscard,
    handleCloseDiscardPreview,
    handleDiscardCardPress,
    handleToolPress,
    handleSelectKOEnergy,
    handleSelectInvocation,
    handleSelectAttack,
    handleActivateTalent,
    handleEndTurn,
  };
}
