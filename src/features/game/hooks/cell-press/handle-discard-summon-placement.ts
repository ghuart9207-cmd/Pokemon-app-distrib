import {
  createPokemonInPlay,
  getBenchRow,
  getKOPenalty,
  getOpponentPlacementDamage,
  isValidDiscardSummon,
} from '@/features/game/rules';
import type { AttackEffect, PokemonInPlay } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/**
 * Effet 'summonFromAnyDiscard' : pose du Pokémon choisi dans une défausse
 * sur une case libre du banc de SON PROPRIÉTAIRE (B pour le joueur 1, C pour le 2).
 */
export function handleDiscardSummonPlacement(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    turnId,
    pendingDiscardSummon,
    player1Discard,
    player2Discard,
    setBoard,
    setMessage,
    setPendingDiscardSummon,
    setPlayer1Damage,
    setPlayer2Damage,
    setPlayer1Discard,
    setPlayer2Discard,
  } = context;

  if (!pendingDiscardSummon) return false;

  const pending = pendingDiscardSummon;

  // Le tour a changé : l'Invocation est annulée.
  if (pending.player !== currentPlayer || pending.turnId !== turnId) {
    setPendingDiscardSummon(null);
    return false;
  }

  if (!pending.selected) {
    setMessage(`${pending.attackName} : choisis d'abord un Pokémon dans une défausse (panneau).`);
    return true;
  }

  const { fromPlayer, discardIndex, cardId } = pending.selected;
  const row = getBenchRow(fromPlayer);
  const ownerText = fromPlayer === currentPlayer ? 'ton banc' : 'le banc adverse';

  if (!cellName.startsWith(row)) {
    setMessage(`Ce Pokémon va sur ${ownerText} : choisis une case libre de ${row}1 à ${row}4.`);
    return true;
  }

  if (board[cellName] !== null) {
    setMessage(`${cellName} est déjà occupée.`);
    return true;
  }

  const discard = fromPlayer === 1 ? player1Discard : player2Discard;
  const card = discard[discardIndex];
  const rule = {
    type: 'summonFromAnyDiscard',
    amount: 1,
    pokemonType: pending.pokemonType,
    maxHp: pending.maxHp,
  } as AttackEffect;

  if (!card || card.id !== cardId || !isValidDiscardSummon(card, rule)) {
    setPendingDiscardSummon({ ...pending, selected: null });
    setMessage("Ce Pokémon n'est plus dans la défausse. Choisis-en un autre.");
    return true;
  }

  // Retirer la carte de sa défausse.
  const setDiscard = fromPlayer === 1 ? setPlayer1Discard : setPlayer2Discard;
  setDiscard((previous) => previous.filter((_, index) => index !== discardIndex));

  // Invocation : appartient au propriétaire de la défausse, 0 Énergie.
  const invocation: PokemonInPlay = createPokemonInPlay({
    card,
    owner: fromPlayer,
    energies: [],
    isInvocation: true,
  });

  const placementDamage = getOpponentPlacementDamage(board, fromPlayer);
  const hpAfter = invocation.currentHp - placementDamage;

  setPendingDiscardSummon(null);

  if (hpAfter <= 0) {
    const penalty = getKOPenalty(card.stage, card.variant);
    const setDamage = fromPlayer === 1 ? setPlayer1Damage : setPlayer2Damage;

    setDamage((damage) => damage + penalty);
    setDiscard((previous) => [...previous, card]);
    setMessage(
      `${card.name} est invoqué en ${cellName}, subit ${placementDamage} dégâts à la pose et est K.O. !`
    );
    return true;
  }

  setBoard((previousBoard) => ({
    ...previousBoard,
    [cellName]: { ...invocation, currentHp: hpAfter },
  }));

  setMessage(
    `${card.name} est invoqué en ${cellName} (${ownerText}) avec 0 Énergie` +
      (placementDamage > 0 ? ` et subit ${placementDamage} dégâts à la pose.` : '.')
  );

  return true;
}
