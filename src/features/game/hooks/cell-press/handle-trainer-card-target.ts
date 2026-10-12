import type { CellPressContext } from './cell-press-context';
import { attachHpTool } from './trainer-effects/attach-hp-tool';
import { attachKOEnergyTool } from './trainer-effects/attach-ko-energy-tool';
import { attachTwoFireEnergiesAndEndTurn } from './trainer-effects/attach-two-fire-energies';
import { healPokemon } from './trainer-effects/heal-pokemon';
import { returnPokemonToHand } from './trainer-effects/return-pokemon-to-hand';
import type {
  TrainerEffectContext,
  TrainerTargetEffectContext,
} from './trainer-effects/trainer-effect-context';

/** Utilisation d'une carte Dresseur : le joueur clique sur le Pokémon ciblé. */
export function handleTrainerCardTarget(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    hasAttackedThisTurn,
    selectedTrainerCard,
    setMessage,
    trainerEffectActivated,
  } = context;

  if (!selectedTrainerCard) return false;

  const target = board[cellName];

  if (target?.isInvocation) {
    setMessage(
      `${target.card.name} est une Invocation et ne peut pas être ciblé par une carte Dresseur.`
    );

    return true;
  }

  

if (!trainerEffectActivated) {
  return false;
}


  if (hasAttackedThisTurn) {
    setMessage('Tu ne peux plus jouer de carte Dresseur après avoir attaqué.');
    return true;
  }

  const effectContext: TrainerEffectContext = {
    ...context,
    cellName,
    selectedTrainerCard,
    target,
  };

  // =====================================
  // SUPPORTER : +2 ÉNERGIES FEU
  // PUIS FIN DU TOUR
  // =====================================

  if (selectedTrainerCard.effect === 'attach2FireEndTurn') {
    attachTwoFireEnergiesAndEndTurn(effectContext);

    return true;
  }

  if (!target) {
    setMessage('Choisis un Pokémon présent sur le plateau.');
    return true;
  }

  const targetContext: TrainerTargetEffectContext = { ...effectContext, target };

  if (
    selectedTrainerCard.effect !== 'bothPlayersSwitch' &&
    target.owner !== currentPlayer
  ) {
    setMessage('Tu dois choisir un de tes propres Pokémon.');
    return true;
  }

  // ------------------------------------
  // SOIN : OBJET +30 / SUPPORTER +20
  // ------------------------------------

  if (
    selectedTrainerCard.effect === 'heal30' ||
    selectedTrainerCard.effect === 'heal20'
  ) {
    healPokemon(targetContext);

    return true;
  }

  // ------------------------------------
  // SUPPORTER : RAMENER UN POKÉMON
  // DANS LA MAIN
  // ------------------------------------

  if (selectedTrainerCard?.effect === 'returnPokemonToHand') {
    returnPokemonToHand(targetContext);

    return true;
  }

  if (selectedTrainerCard.effect === 'moveEnergyOnKO') {
    attachKOEnergyTool(targetContext);

    return true;
  }

  if (selectedTrainerCard.effect === 'toolHp40') {
    attachHpTool(targetContext);

    return true;
  }

  return false;
}
