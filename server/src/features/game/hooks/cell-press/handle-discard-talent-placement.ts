import { createPokemonInPlay } from '@/features/game/rules';
import type { EnergyType } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/** Place sur le banc un Pokémon récupéré par son Talent depuis la défausse. */
export function handleDiscardTalentPlacement(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    pendingDiscardTalentPlacement,
    player1Discard,
    player2Discard,
    player1DiscardEnergies,
    player2DiscardEnergies,
    usedDiscardTalentKeys,
    setBoard,
    setMessage,
    setPendingDiscardTalentPlacement,
    setUsedDiscardTalentKeys,
    setPlayer1Discard,
    setPlayer2Discard,
    setPlayer1DiscardEnergies,
    setPlayer2DiscardEnergies,
    setSelectedCard,
    setSelectedPokemonCell,
    setSelectedAttackIndex,
    setOpenedDiscardPlayer,
  } = context;

  if (!pendingDiscardTalentPlacement) {
    return false;
  }

  const { player, card, discardIndex } = pendingDiscardTalentPlacement;

  if (currentPlayer !== player) {
    setPendingDiscardTalentPlacement(null);
    setMessage("Le tour a changé. Le placement du Talent est annulé.");
    return true;
  }

  const expectedRow = player === 1 ? 'B' : 'C';

if (!cellName.startsWith(expectedRow)) {
  setMessage(
    `Choisis une case de ton plateau : ${expectedRow}1 à ${expectedRow}4.`
  );
  return true;
}

  if (board[cellName]) {
    setMessage(`${cellName} est déjà occupée. Choisis une case vide du banc.`);
    return true;
  }

  const discard = player === 1 ? player1Discard : player2Discard;

  // Vérifier que la carte choisie se trouve toujours dans la défausse.
  let actualDiscardIndex =
    discard[discardIndex] === card
      ? discardIndex
      : discard.findIndex((discardCard) => discardCard === card);

  if (
    actualDiscardIndex === -1 &&
    discard[discardIndex]?.id === card.id
  ) {
    actualDiscardIndex = discardIndex;
  }

  if (actualDiscardIndex === -1) {
    setPendingDiscardTalentPlacement(null);
    setMessage("Ce Pokémon n'est plus dans la défausse. Le Talent est annulé.");
    return true;
  }

  if (card.talent?.effect !== 'recoverFromDiscardOncePerGame') {
    setPendingDiscardTalentPlacement(null);
    setMessage("Ce Pokémon ne possède pas le Talent attendu.");
    return true;
  }

  const usedKey = `${player}:${card.id}`;

  if (usedDiscardTalentKeys.includes(usedKey)) {
    setPendingDiscardTalentPlacement(null);
    setMessage("Ce Talent a déjà été utilisé pendant cette partie.");
    return true;
  }

  const discardEnergies =
    player === 1 ? player1DiscardEnergies : player2DiscardEnergies;

  const energyIndex = discardEnergies.indexOf('obscurite');

  const startingEnergies: EnergyType[] =
    energyIndex !== -1 ? ['obscurite'] : [];

  const pokemonToPlace = createPokemonInPlay({
    card,
    owner: player,
    energies: startingEnergies,
  });

  // Retirer uniquement la carte choisie de la défausse.
  if (player === 1) {
    setPlayer1Discard((previous) =>
      previous.filter((_, index) => index !== actualDiscardIndex)
    );
  } else {
    setPlayer2Discard((previous) =>
      previous.filter((_, index) => index !== actualDiscardIndex)
    );
  }

  // Retirer une seule Énergie Obscurité, si elle existe.
  if (energyIndex !== -1) {
    const newDiscardEnergies = [...discardEnergies];
    newDiscardEnergies.splice(energyIndex, 1);

    if (player === 1) {
      setPlayer1DiscardEnergies(newDiscardEnergies);
    } else {
      setPlayer2DiscardEnergies(newDiscardEnergies);
    }
  }

  // Poser le Pokémon sur la case de banc choisie.
  setBoard((previousBoard) => ({
    ...previousBoard,
    [cellName]: pokemonToPlace,
  }));

  // Mémoriser l'utilisation jusqu'à la fin de la partie.
  setUsedDiscardTalentKeys((previous) =>
    previous.includes(usedKey) ? previous : [...previous, usedKey]
  );

  setPendingDiscardTalentPlacement(null);
  setOpenedDiscardPlayer(null);
  setSelectedCard(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    energyIndex !== -1
      ? `${card.name} est placé sur le banc en ${cellName} avec une Énergie Obscurité récupérée de la défausse.`
      : `${card.name} est placé sur le banc en ${cellName}, sans Énergie Obscurité car aucune n'était disponible dans la défausse.`
  );

  return true;
}