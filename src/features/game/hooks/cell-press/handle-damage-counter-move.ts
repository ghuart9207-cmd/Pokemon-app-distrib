import { getKOPenalty, getPokemonMaxHp } from '@/features/game/rules';
import type { BoardState } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';

/**
 * Talent « déplacer un marqueur de dégâts » (Lugulabre, Déplacement Louche) :
 * 1er clic : un Pokémon blessé qui donne le marqueur
 *            (l'un de vos Pokémon si `fromOwnPokemonOnly`, sinon n'importe lequel) ;
 * 2e clic : un autre Pokémon (n'importe quel camp) qui le reçoit.
 * Clic sur une case vide : le Talent est annulé (il reste disponible).
 *
 * Un marqueur n'est pas une attaque : faiblesse, résistance, réductions
 * et protections contre les attaques ne s'appliquent pas.
 */
export function handleDamageCounterMove(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    turnId,
    pendingDamageCounterMove,
    setPendingDamageCounterMove,
    setBoard,
    setMessage,
    prepareKOEnergyMove,
    setPlayer1Damage,
    setPlayer2Damage,
    setPlayer1Discard,
    setPlayer2Discard,
    setPlayer1DiscardEnergies,
    setPlayer2DiscardEnergies,
  } = context;

  if (!pendingDamageCounterMove) return false;

  const pending = pendingDamageCounterMove;

  // Le tour a changé : on annule.
  if (pending.player !== currentPlayer || pending.turnId !== turnId) {
    setPendingDamageCounterMove(null);
    return false;
  }

  const source = board[pending.sourceCell];

  if (!source || source.lastUsedTalentTurnId === turnId) {
    setPendingDamageCounterMove(null);
    setMessage("Le Talent n'est plus disponible.");
    return true;
  }

  const clicked = board[cellName];
  const talentName = source.card.talent?.name ?? 'Talent';

  // Case vide : annulation.
  if (!clicked) {
    setPendingDamageCounterMove(null);
    setMessage(`${talentName} annulé. Tu pourras l'utiliser plus tard pendant ce tour.`);
    return true;
  }

  // -----------------------------
  // 1er CLIC : POKÉMON QUI DONNE
  // -----------------------------
  if (!pending.fromCell) {
    if (pending.fromOwnPokemonOnly && clicked.owner !== pending.player) {
      setMessage(`${talentName} : le marqueur doit venir de l'un de TES Pokémon.`);
      return true;
    }

    if (clicked.currentHp >= getPokemonMaxHp(clicked)) {
      setMessage(
        `${clicked.card.name} n'a aucun marqueur de dégâts. Choisis un Pokémon blessé.`
      );
      return true;
    }

    setPendingDamageCounterMove({ ...pending, fromCell: cellName });
    setMessage(
      `${talentName} : marqueur pris sur ${clicked.card.name} (${cellName}). Choisis maintenant le Pokémon qui le reçoit (clic sur ${clicked.card.name} pour changer).`
    );
    return true;
  }

  // Re-clic sur le même Pokémon : on change de choix.
  if (cellName === pending.fromCell) {
    setPendingDamageCounterMove({ ...pending, fromCell: null });
    setMessage(`${talentName} : choisis le Pokémon blessé qui donne le marqueur.`);
    return true;
  }

  const from = board[pending.fromCell];

  if (!from || from.currentHp >= getPokemonMaxHp(from)) {
    setPendingDamageCounterMove({ ...pending, fromCell: null });
    setMessage(`${talentName} : choisis à nouveau le Pokémon blessé qui donne le marqueur.`);
    return true;
  }

  // -----------------------------
  // 2e CLIC : DÉPLACEMENT
  // -----------------------------
  const amount = pending.amount;
  const to = clicked;

  const nextBoard: BoardState = { ...board };

  // Le Pokémon qui donne récupère 10 PV (sans dépasser son maximum).
  nextBoard[pending.fromCell] = {
    ...from,
    currentHp: Math.min(getPokemonMaxHp(from), from.currentHp + amount),
  };

  const hpAfter = to.currentHp - amount;
  const knockedOut = hpAfter <= 0;

  if (knockedOut) {
    nextBoard[cellName] = null;
  } else {
    nextBoard[cellName] = { ...to, currentHp: hpAfter };
  }

  // Le Pokémon au Talent l'a utilisé pour ce tour
  // (sa case a pu changer ci-dessus s'il donnait ou recevait).
  const holder = nextBoard[pending.sourceCell];
  if (holder) {
    nextBoard[pending.sourceCell] = { ...holder, lastUsedTalentTurnId: turnId };
  }

  if (knockedOut) {
    const penalty = getKOPenalty(to.card.stage, to.card.variant);
    const discarded = [to.card, ...(to.attachedTool ? [to.attachedTool] : [])];

    prepareKOEnergyMove(to, nextBoard);

    if (to.owner === 1) {
      setPlayer1Damage((damage) => damage + penalty);
      setPlayer1Discard((discard) => [...discard, ...discarded]);
      setPlayer1DiscardEnergies((discard) => [...discard, ...to.energies]);
    } else {
      setPlayer2Damage((damage) => damage + penalty);
      setPlayer2Discard((discard) => [...discard, ...discarded]);
      setPlayer2DiscardEnergies((discard) => [...discard, ...to.energies]);
    }
  }

  setBoard(nextBoard);
  setPendingDamageCounterMove(null);

  setMessage(
    `${talentName} : un marqueur de dégâts passe de ${from.card.name} à ${to.card.name}.` +
      (knockedOut
        ? ` ${to.card.name} est K.O. ! Le joueur ${to.owner} reçoit +${getKOPenalty(to.card.stage, to.card.variant)} dégâts.`
        : '')
  );

  return true;
}
