import { getPokemonMaxHp } from '@/features/game/rules';
import type { CellPressContext } from './cell-press-context';

/**
 * Talent 'returnToolToHandOncePerTurn' : une seule fois pendant votre tour,
 * placez dans votre main une carte Outil attachée à l'un de vos Pokémon.
 * Clic sur une case vide : le Talent est annulé (il reste disponible).
 */
export function handleTalentToolReturn(context: CellPressContext, cellName: string): boolean {
  const {
    board,
    currentPlayer,
    turnId,
    pendingTalentToolReturn,
    setPendingTalentToolReturn,
    setBoard,
    setMessage,
    setPlayer1Hand,
    setPlayer2Hand,
  } = context;

  if (!pendingTalentToolReturn) return false;

  const pending = pendingTalentToolReturn;

  // Le tour a changé : on annule.
  if (pending.player !== currentPlayer || pending.turnId !== turnId) {
    setPendingTalentToolReturn(null);
    return false;
  }

  const source = board[pending.sourceCell];

  if (!source || source.lastUsedTalentTurnId === turnId) {
    setPendingTalentToolReturn(null);
    setMessage("Le Talent n'est plus disponible.");
    return true;
  }

  const talentName = source.card.talent?.name ?? 'Talent';
  const target = board[cellName];

  if (!target) {
    setPendingTalentToolReturn(null);
    setMessage(`${talentName} annulé. Tu pourras l'utiliser plus tard pendant ce tour.`);
    return true;
  }

  if (target.owner !== pending.player || !target.attachedTool) {
    setMessage(`${talentName} : choisis l'un de TES Pokémon qui porte une carte Outil.`);
    return true;
  }

  const tool = target.attachedTool;
  const withoutTool = { ...target, attachedTool: null };

  // Un Outil peut augmenter les PV maximum : les dégâts déjà subis restent.
  const lostMaxHp = Math.max(0, getPokemonMaxHp(target) - getPokemonMaxHp(withoutTool));
  const hpAfterToolLoss = withoutTool.currentHp - lostMaxHp;

  if (hpAfterToolLoss <= 0) {
    setMessage(
      `${target.card.name} serait mis K.O. sans ${tool.name} : choisis un autre Pokémon (ou une case vide pour annuler).`
    );
    return true;
  }

  setBoard((previousBoard) => {
    const nextBoard = { ...previousBoard };
    const current = nextBoard[cellName];

    if (current) {
      nextBoard[cellName] = { ...current, attachedTool: null, currentHp: hpAfterToolLoss };
    }

    // Le Talent est marqué comme utilisé (relu après, au cas où c'est le même Pokémon).
    const talentOwner = nextBoard[pending.sourceCell];
    if (talentOwner) {
      nextBoard[pending.sourceCell] = { ...talentOwner, lastUsedTalentTurnId: turnId };
    }

    return nextBoard;
  });

  const setHand = pending.player === 1 ? setPlayer1Hand : setPlayer2Hand;
  setHand((hand) => [...hand, tool]);

  setPendingTalentToolReturn(null);
  setMessage(`${talentName} : ${tool.name} de ${target.card.name} retourne dans ta main.`);
  return true;
}
