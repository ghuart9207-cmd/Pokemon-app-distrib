import { getKOPenalty, getTalentDamageReduction } from '@/features/game/rules';
import type { BoardState } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/**
 * Effet 'damageOneOwnBenchPokemon' : après l'attaque, le joueur choisit
 * l'un de SES Pokémon (autre que l'attaquant), qui subit les dégâts.
 */
export function handleOwnBenchDamage(context: CellPressContext, cellName: string): boolean {
  const {
    board,
    currentPlayer,
    turnId,
    pendingOwnBenchDamage,
    setPendingOwnBenchDamage,
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

  if (!pendingOwnBenchDamage) return false;

  const pending = pendingOwnBenchDamage;

  // Le tour a changé : on annule.
  if (pending.player !== currentPlayer || pending.turnId !== turnId) {
    setPendingOwnBenchDamage(null);
    return false;
  }

  const target = board[cellName];

  if (!target || target.owner !== pending.player || cellName === pending.attackerCell) {
    setMessage(
      `${pending.attackName} : choisis l'un de TES Pokémon de banc (pas l'attaquant) qui subira ${pending.amount} dégâts.`
    );
    return true;
  }

  // Réductions de Talent (ex : Azumarill) comme pour les autres dégâts sur son propre banc.
  const attacker = board[pending.attackerCell];
  const damage = Math.max(0, pending.amount - getTalentDamageReduction(target, attacker));
  const hpAfter = target.currentHp - damage;

  const nextBoard: BoardState = { ...board };

  setPendingOwnBenchDamage(null);

  if (hpAfter > 0) {
    nextBoard[cellName] = { ...target, currentHp: hpAfter };
    setBoard(nextBoard);
    setMessage(`${target.card.name} subit ${damage} dégâts à cause de ${pending.attackName}.`);
    return true;
  }

  // K.O.
  const penalty = getKOPenalty(target.card.stage, target.card.variant);
  const discarded = [target.card, ...(target.attachedTool ? [target.attachedTool] : [])];

  nextBoard[cellName] = null;
  prepareKOEnergyMove(target, nextBoard);

  if (target.owner === 1) {
    setPlayer1Damage((value) => value + penalty);
    setPlayer1Discard((discard) => [...discard, ...discarded]);
    setPlayer1DiscardEnergies((discard) => [...discard, ...target.energies]);
  } else {
    setPlayer2Damage((value) => value + penalty);
    setPlayer2Discard((discard) => [...discard, ...discarded]);
    setPlayer2DiscardEnergies((discard) => [...discard, ...target.energies]);
  }

  setBoard(nextBoard);
  setMessage(
    `${target.card.name} subit ${damage} dégâts à cause de ${pending.attackName} et est K.O. ! Le joueur ${target.owner} reçoit +${penalty} dégâts.`
  );
  return true;
}
