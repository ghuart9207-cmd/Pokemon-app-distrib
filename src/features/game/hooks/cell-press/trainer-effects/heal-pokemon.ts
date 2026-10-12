import { getPokemonMaxHp } from '@/features/game/rules';
import type { TrainerTargetEffectContext } from './trainer-effect-context';

/** Soin : Potion (Objet, +30 PV) ou Supporter (+20 PV) sur un de ses Pokémon. */
export function healPokemon(context: TrainerTargetEffectContext): void {
  const {
    cellName,
    currentPlayer,
    hasUsedSupporterThisTurn,
    selectedTrainerCard,
    setBoard,
    setHasUsedSupporterThisTurn,
    setMessage,
    setPlayer1Discard,
    setPlayer1Hand,
    setPlayer2Discard,
    setPlayer2Hand,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
    setSelectedTrainerCard,
    setTrainerEffectActivated,
    target,
  } = context;
  // Si c'est un Supporter, un seul
  // Supporter peut être utilisé par tour
  if (selectedTrainerCard.category === 'supporter' && hasUsedSupporterThisTurn) {
    setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
    return;
  }

  const targetMaxHp = getPokemonMaxHp(target);

  // Pokémon déjà au maximum :
  // la carte reste dans la main
  if (target.currentHp >= targetMaxHp) {
    setMessage(`${target.card.name} a déjà tous ses PV.`);
    return;
  }

  const healAmount = selectedTrainerCard.effect === 'heal30' ? 30 : 20;

  const healedHp = Math.min(target.currentHp + healAmount, targetMaxHp);

  const actualHeal = healedHp - target.currentHp;

  // Applique le soin
  setBoard((previousBoard) => ({
    ...previousBoard,

    [cellName]: {
      ...target,
      currentHp: healedHp,
    },
  }));

  // --------------------------------
  // CARTE -> DÉFAUSSE
  // --------------------------------

  if (currentPlayer === 1) {
    setPlayer1Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));

    setPlayer1Discard((discard) => [...discard, selectedTrainerCard]);
  } else {
    setPlayer2Hand((hand) => hand.filter((card) => card.id !== selectedTrainerCard.id));

    setPlayer2Discard((discard) => [...discard, selectedTrainerCard]);
  }

  // Si c'était un Supporter,
  // on compte le Supporter comme utilisé
  if (selectedTrainerCard.category === 'supporter') {
    setHasUsedSupporterThisTurn(true);
  }

  setMessage(
    `${target.card.name} récupère ${actualHeal} PV (${healedHp}/${targetMaxHp} PV).`
  );

  setSelectedTrainerCard(null);
  setTrainerEffectActivated(false);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);
}
