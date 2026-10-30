import { getPokemonMaxHp, isHealBlocked } from '@/features/game/rules';
import type { CellPressContext } from './cell-press-context';

/**
 * Talent 'healOwnPokemonOncePerTurn' : une seule fois pendant votre tour,
 * soignez X dégâts à l'un de vos Pokémon (le Pokémon au Talent compris).
 * Clic sur une case vide : le Talent est annulé (il reste disponible).
 */
export function handleTalentHeal(context: CellPressContext, cellName: string): boolean {
  const { board, currentPlayer, turnId, pendingTalentHeal, setPendingTalentHeal, setBoard, setMessage } =
    context;

  if (!pendingTalentHeal) return false;

  const pending = pendingTalentHeal;

  // Le tour a changé : on annule.
  if (pending.player !== currentPlayer || pending.turnId !== turnId) {
    setPendingTalentHeal(null);
    return false;
  }

  const source = board[pending.sourceCell];

  if (!source || source.lastUsedTalentTurnId === turnId) {
    setPendingTalentHeal(null);
    setMessage("Le Talent n'est plus disponible.");
    return true;
  }

  const talentName = source.card.talent?.name ?? 'Talent';
  const target = board[cellName];

  if (!target) {
    setPendingTalentHeal(null);
    setMessage(`${talentName} annulé. Tu pourras l'utiliser plus tard pendant ce tour.`);
    return true;
  }

  if (target.owner !== pending.player) {
    setMessage(`${talentName} : choisis l'un de TES Pokémon.`);
    return true;
  }

  const maxHp = getPokemonMaxHp(target);

  if (target.currentHp >= maxHp) {
    setMessage(`${target.card.name} n'a aucun dégât à soigner. Choisis un Pokémon blessé.`);
    return true;
  }

  if (isHealBlocked(target)) {
    setMessage(`${target.card.name} ne peut pas être soigné pendant ce tour.`);
    return true;
  }

  const healed = Math.min(pending.amount, maxHp - target.currentHp);

  setBoard((previousBoard) => {
    const nextBoard = { ...previousBoard };
    const current = nextBoard[cellName];

    if (current) {
      nextBoard[cellName] = { ...current, currentHp: current.currentHp + healed };
    }

    // Le Talent est marqué comme utilisé (en relisant la case après le soin,
    // au cas où le Pokémon soigné est celui qui possède le Talent).
    const talentOwner = nextBoard[pending.sourceCell];
    if (talentOwner) {
      nextBoard[pending.sourceCell] = { ...talentOwner, lastUsedTalentTurnId: turnId };
    }

    return nextBoard;
  });

  setPendingTalentHeal(null);
  setMessage(`${talentName} : ${target.card.name} est soigné de ${healed} dégâts.`);
  return true;
}
