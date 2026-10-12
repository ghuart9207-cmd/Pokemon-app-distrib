import type { PokemonInPlay } from '@/features/game/types';
import type { AttackResolutionContext } from './attack-resolution-context';

/** Attaque ratée au pile ou face : l'attaquant ne subit que les dégâts de confusion éventuels. */
export function resolveFailedAttack(
  context: AttackResolutionContext,
  locals: { attacker: PokemonInPlay; selectedPokemonCell: string }
): void {
  const { board, handleAttackerKO, setBoard, setMessage, setSelectedAttackIndex } =
    context;
  const { attacker, selectedPokemonCell } = locals;
  const newBoard = {
    ...board,
  };

  const confusedDamage = attacker.confused ? 30 : 0;

  const failedAttacker = {
    ...attacker,

    currentHp: attacker.currentHp - confusedDamage,

    hasAttacked: true,
  };

  newBoard[selectedPokemonCell] = failedAttacker;

  const attackerKO = handleAttackerKO(newBoard, failedAttacker, selectedPokemonCell);

  setBoard(newBoard);
  setMessage(
    attackerKO
      ? `PILE ! ${attacker.card.name} rate son attaque et est K.O.`
      : `PILE ! ${attacker.card.name} rate son attaque.`
  );
  setSelectedAttackIndex(null);
}
