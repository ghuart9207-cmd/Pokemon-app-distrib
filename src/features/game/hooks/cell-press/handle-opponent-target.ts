import { getKOPenalty, getPokemonMaxHp } from '@/features/game/rules';
import type { BoardState } from '@/features/game/types';
import type { CellPressContext } from './cell-press-context';
import { doesTemporaryProtectionPreventDamage } from
  '@/features/game/rules/temporary-attack-protection';
  import { applyTargetRetreatBlock } from
  '@/features/game/rules/retreat-block-rules';
import { applyHandEnergyBlockFromAttack } from
  '@/features/game/rules';



/** Choix d'un Pokémon adverse ciblé par une attaque. */
export function handleOpponentTarget(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    doesTalentPreventAllAttackEffects,
    pendingOpponentTarget,
    prepareKOEnergyMove,
    setBoard,
    setMessage,
    setPendingOpponentTarget,
    setPlayer1Damage,
    setPlayer1Discard,
    setPlayer1DiscardEnergies,
    setPlayer2Damage,
    setPlayer2Discard,
    setPlayer2DiscardEnergies,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
    startKOSurvivalTalent,
  } = context;

  if (!pendingOpponentTarget) return false;

  const target = board[cellName];

  // Case vide
  if (!target) {
    setMessage('Choisis un Pokémon adverse.');
    return true;
  }

  // Pokémon du mauvais joueur
  if (target.owner === pendingOpponentTarget.player) {
    setMessage('Tu dois choisir un Pokémon adverse.');
    return true;
  }

  if (
    pendingOpponentTarget.mode === 'damagedOpponentOrPlayer' &&
    target.currentHp >= getPokemonMaxHp(target)
  ) {
    setMessage(`${target.card.name} n'a aucun marqueur de dégâts.`);

    return true;
  }

  if (
    pendingOpponentTarget.mode === 'benchOrPlayer' &&
    pendingOpponentTarget.excludedCell === cellName
  ) {
    setMessage(
  `${target.card.name} a déjà reçu les dégâts principaux. Choisis une autre cible adverse.`
);

    return true;
  }
  
const pendingAttacker =
  board[pendingOpponentTarget.attackerCell];


  if (pendingAttacker && doesTalentPreventAllAttackEffects(target, pendingAttacker)) {
    setMessage(
      `${target.card.name} évite tous les effets de l'attaque grâce à son Talent ${target.card.talent?.name}.`
    );

    setPendingOpponentTarget(null);
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    return true;
  }

  const pendingExtraDamage =
  target.extraDamageNextTurnReady &&
  target.extraDamageNextTurnSourcePlayer === pendingOpponentTarget.player &&
  (
    target.extraDamageNextTurnEnergyType == null ||
    target.extraDamageNextTurnEnergyType === pendingAttacker?.card.type
  )
    ? (target.extraDamageNextTurn ?? 0)
    : 0;

  
const protectedFromDamage =
  pendingAttacker != null &&
  doesTemporaryProtectionPreventDamage(
    target,
    pendingAttacker
  );

// Talent d'Azumarill :
  // réduit de 30 les dégâts des attaques
  // provenant d'un Pokémon Feu ou Eau.
  const fireWaterReduction =
    target.card.talent?.type === 'passive' &&
    target.card.talent.effect === 'reduceDamageFromFireWater' &&
    pendingAttacker !== null &&
    (pendingAttacker.card.type === 'feu' ||
      pendingAttacker.card.type === 'eau')
      ? (target.card.talent.amount ?? 30)
      : 0;

const pendingDamage = protectedFromDamage
  ? 0
  : pendingOpponentTarget.damage + pendingExtraDamage - fireWaterReduction;


  const remainingHp = target.currentHp - pendingDamage;

  // -----------------------------
  // K.O.
  // -----------------------------

  if (remainingHp <= 0) {
    const updatedBoard: BoardState = {
      ...board,
    };

    // =================================
    // TALENT DE SCARHINO
    // =================================

    if (
      startKOSurvivalTalent(
        {
          ...target,
          currentHp: remainingHp,
        },

        cellName,

        updatedBoard
      )
    ) {
      setPendingOpponentTarget(null);
      setSelectedPokemonCell(null);
      setSelectedAttackIndex(null);

      return true;
    }

    // =================================
    // K.O. NORMAL
    // =================================

    const penalty = getKOPenalty(target.card.stage, target.card.variant);

    updatedBoard[cellName] = null;

    prepareKOEnergyMove(target, updatedBoard);

    if (target.owner === 1) {
      setPlayer1Damage((damage) => damage + penalty);

      setPlayer1DiscardEnergies((discard) => [...discard, ...target.energies]);

      setPlayer1Discard((discard) => [...discard, target.card]);
    } else {
      setPlayer2Damage((damage) => damage + penalty);

      setPlayer2DiscardEnergies((discard) => [...discard, ...target.energies]);

      setPlayer2Discard((discard) => [...discard, target.card]);
    }

    setBoard(updatedBoard);

    setMessage(
      `${target.card.name} subit ${pendingDamage} dégâts et est K.O. ! Le joueur ${target.owner} reçoit +${penalty} dégâts.`
    );

    setPendingOpponentTarget(null);
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    return true;
  }

  // -----------------------------
  // LE POKÉMON SURVIT
  // -----------------------------

  const extraDamageNextTurnEffect =
  target.preventAllAttackDamageAndEffects === true
    ? undefined
    : pendingOpponentTarget.effects?.find(
        (effect) => effect.type === 'takeExtraDamageNextTurn'
      );

setBoard((previousBoard) => ({
  ...previousBoard,

  [cellName]: applyTargetRetreatBlock(
    {
      ...target,
      currentHp: remainingHp,
      extraDamageNextTurn: extraDamageNextTurnEffect
  ? extraDamageNextTurnEffect.amount
  : target.extraDamageNextTurn,

extraDamageNextTurnSourcePlayer: extraDamageNextTurnEffect
  ? pendingOpponentTarget.player
  : target.extraDamageNextTurnSourcePlayer,

extraDamageNextTurnReady: extraDamageNextTurnEffect
  ? false
  : target.extraDamageNextTurnReady,

extraDamageNextTurnEnergyType: extraDamageNextTurnEffect
  ? extraDamageNextTurnEffect.energyType
  : target.extraDamageNextTurnEnergyType,
    },
    pendingOpponentTarget.effects,
    target.preventAllAttackDamageAndEffects === true
  ),
}));


  setMessage(`${target.card.name} subit ${pendingDamage} dégâts.`);

  setPendingOpponentTarget(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  return true;
}
