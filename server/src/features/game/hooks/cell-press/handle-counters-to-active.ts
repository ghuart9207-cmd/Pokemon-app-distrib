import { getKOPenalty, getPokemonMaxHp } from '@/features/game/rules';
import type { BoardState } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/**
 * Effet 'moveCountersFromOwnToOpponentActive' : le joueur clique sur 2 de SES
 * Pokémon blessés ; chacun donne jusqu'à `perPokemon` dégâts (4 marqueurs = 40)
 * au Pokémon actif adverse (ou au joueur adverse s'il n'y a pas de Pokémon en face).
 * Ce sont des marqueurs : pas de faiblesse, résistance ni réduction.
 */
export function handleCountersToActive(context: CellPressContext, cellName: string): boolean {
  const {
    board,
    currentPlayer,
    turnId,
    pendingCountersToActive,
    setPendingCountersToActive,
    prepareKOEnergyMove,
    setBoard,
    setMessage,
    setPlayer1Damage,
    setPlayer2Damage,
    setPlayer1Discard,
    setPlayer2Discard,
    setPlayer1DiscardEnergies,
    setPlayer2DiscardEnergies,
  } = context;

  if (!pendingCountersToActive) return false;

  const pending = pendingCountersToActive;

  if (pending.player !== currentPlayer || pending.turnId !== turnId) {
    setPendingCountersToActive(null);
    return false;
  }

  const source = board[cellName];

  if (
    !source ||
    source.owner !== pending.player ||
    pending.usedCells.includes(cellName) ||
    source.currentHp >= getPokemonMaxHp(source)
  ) {
    setMessage(
      `${pending.attackName} : clique sur l'un de TES Pokémon blessés (pas déjà choisi) pour déplacer ses marqueurs.`
    );
    return true;
  }

  const damageTaken = getPokemonMaxHp(source) - source.currentHp;
  const moved = Math.min(pending.perPokemon, damageTaken);
  const opponent = pending.player === 1 ? 2 : 1;

  const nextBoard: BoardState = { ...board };
  nextBoard[cellName] = { ...source, currentHp: source.currentHp + moved };

  let resultText = `${moved / 10} marqueur(s) de ${source.card.name}`;
  let targetKnockedOut = false;

  // --- Vers le Pokémon actif adverse ---
  if (pending.targetCell) {
    const target = nextBoard[pending.targetCell];

    if (!target) {
      setPendingCountersToActive(null);
      setMessage(`${pending.attackName} : le Pokémon actif adverse n'est plus en jeu.`);
      return true;
    }

    const hpAfter = target.currentHp - moved;
    resultText += ` passent sur ${target.card.name}.`;

    if (hpAfter > 0) {
      nextBoard[pending.targetCell] = { ...target, currentHp: hpAfter };
    } else {
      targetKnockedOut = true;
      const penalty = getKOPenalty(target.card.stage, target.card.variant);
      const discarded = [target.card, ...(target.attachedTool ? [target.attachedTool] : [])];

      nextBoard[pending.targetCell] = null;
      prepareKOEnergyMove(target, nextBoard);

      if (target.owner === 1) {
        setPlayer1Damage((damage) => damage + penalty);
        setPlayer1Discard((discard) => [...discard, ...discarded]);
        setPlayer1DiscardEnergies((discard) => [...discard, ...target.energies]);
      } else {
        setPlayer2Damage((damage) => damage + penalty);
        setPlayer2Discard((discard) => [...discard, ...discarded]);
        setPlayer2DiscardEnergies((discard) => [...discard, ...target.energies]);
      }

      resultText += ` ${target.card.name} est K.O. ! Le joueur ${target.owner} reçoit +${penalty} dégâts.`;
    }
  } else {
    // --- Pas de Pokémon en face : vers le joueur adverse (jamais K.O.) ---
    const setOpponentDamage = opponent === 1 ? setPlayer1Damage : setPlayer2Damage;
    setOpponentDamage((damage) => damage + moved);
    resultText += ` passent sur le joueur ${opponent}.`;
  }

  setBoard(nextBoard);

  const remainingPicks = pending.remainingPicks - 1;
  const usedCells = [...pending.usedCells, cellName];

  const hasOtherDamagedPokemon = Object.entries(nextBoard).some(
    ([cell, pokemon]) =>
      pokemon !== null &&
      pokemon.owner === pending.player &&
      !usedCells.includes(cell) &&
      pokemon.currentHp < getPokemonMaxHp(pokemon)
  );

  if (remainingPicks > 0 && !targetKnockedOut && hasOtherDamagedPokemon) {
    setPendingCountersToActive({ ...pending, remainingPicks, usedCells });
    setMessage(`${resultText} Choisis maintenant un autre de tes Pokémon blessés.`);
    return true;
  }

  setPendingCountersToActive(null);
  setMessage(resultText);
  return true;
}
