import { getTalentDamageReduction } from '@/features/game/rules';
import {
  getKOPenalty,
  getPokemonMaxHp,
  getRetaliationDamage,
  getCoinCheckForTarget,
  getOutgoingReductionForTarget,
  doesToolAttackerShieldPreventDamage,
  doesTalentBurnAttacker,
  burnAttackingPokemon,
  isAttackDamagePreventedByEffect,
  getTargetTypeBonusDamage,
} from '@/features/game/rules';
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
  (doesTemporaryProtectionPreventDamage(target, pendingAttacker) ||
    isAttackDamagePreventedByEffect(target, pendingAttacker) ||
    doesToolAttackerShieldPreventDamage(target, pendingAttacker, board));

// Talent d'Azumarill :
  // réduit de 30 les dégâts des attaques
  // provenant d'un Pokémon Feu ou Eau.
  // (et Talent « subit 30 dégâts de moins provenant des attaques »)
  const fireWaterReduction = getTalentDamageReduction(target, pendingAttacker, board);

const pendingDamage = protectedFromDamage
  ? 0
  : Math.max(
      0,
      pendingOpponentTarget.damage +
        pendingExtraDamage +
        // Bonus selon le type du Pokémon choisi.
        getTargetTypeBonusDamage(pendingOpponentTarget.effects, target) -
        fireWaterReduction
    );


  const remainingHp = target.currentHp - pendingDamage;

  // --------------------------------
  // CONTRE-COUP : MARQUEURS SUR L'ATTAQUANT
  // --------------------------------
  const retaliation = getRetaliationDamage(target, pendingAttacker, pendingDamage, board, cellName);

  /** Applique le contre-coup sur la copie du plateau et renvoie le texte à afficher. */
  const burnsAttacker = doesTalentBurnAttacker(target, cellName, board, pendingAttacker, pendingDamage);

  const applyRetaliation = (boardDraft: BoardState): string => {
    if (retaliation <= 0 && !burnsAttacker) return '';

    const attackerCell = pendingOpponentTarget.attackerCell;
    const attackerBefore = boardDraft[attackerCell];
    if (!attackerBefore) return '';

    // Talent du défenseur actif : l'attaquant est maintenant Brûlé.
    const attackerNow = burnsAttacker ? burnAttackingPokemon(attackerBefore) : attackerBefore;
    const burnText = burnsAttacker
      ? ` ${target.card.talent?.name ?? 'Talent'} : ${attackerNow.card.name} est maintenant Brûlé !`
      : '';
    boardDraft[attackerCell] = attackerNow;

    if (retaliation <= 0) return burnText;

    const hpAfter = attackerNow.currentHp - retaliation;
    const text = `${burnText} Contre-coup : ${attackerNow.card.name} reçoit ${retaliation / 10} marqueurs de dégâts (${retaliation}).`;

    if (hpAfter > 0) {
      boardDraft[attackerCell] = { ...attackerNow, currentHp: hpAfter };
      return text;
    }

    // L'attaquant est K.O.
    const penalty = getKOPenalty(attackerNow.card.stage, attackerNow.card.variant);
    const discarded = [
      attackerNow.card,
      ...(attackerNow.attachedTool ? [attackerNow.attachedTool] : []),
    ];

    boardDraft[attackerCell] = null;
    prepareKOEnergyMove(attackerNow, boardDraft);

    if (attackerNow.owner === 1) {
      setPlayer1Damage((damage) => damage + penalty);
      setPlayer1Discard((discard) => [...discard, ...discarded]);
      setPlayer1DiscardEnergies((discard) => [...discard, ...attackerNow.energies]);
    } else {
      setPlayer2Damage((damage) => damage + penalty);
      setPlayer2Discard((discard) => [...discard, ...discarded]);
      setPlayer2DiscardEnergies((discard) => [...discard, ...attackerNow.energies]);
    }

    return `${text} ${attackerNow.card.name} est K.O. ! Le joueur ${attackerNow.owner} reçoit +${penalty} dégâts.`;
  };

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
      const survivalRetaliationText = applyRetaliation(updatedBoard);
      if (survivalRetaliationText) {
        setBoard(updatedBoard);
      }
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

    const koRetaliationText = applyRetaliation(updatedBoard);

    setBoard(updatedBoard);

    setMessage(
      `${target.card.name} subit ${pendingDamage} dégâts et est K.O. ! Le joueur ${target.owner} reçoit +${penalty} dégâts.` +
        koRetaliationText
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

const survivorBoard: BoardState = {
  ...board,

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

// Ne peut pas être soigné pendant le prochain tour de son propriétaire.
healBlockedEndPlayer:
  target.preventAllAttackDamageAndEffects !== true &&
  pendingOpponentTarget.effects?.some(
    (effect) => effect.type === 'preventTargetHealingNextOpponentTurn'
  )
    ? target.owner
    : target.healBlockedEndPlayer,

// S'il attaque pendant son prochain tour : lancer de pièces avant.
attackCoinCheck:
  (target.preventAllAttackDamageAndEffects !== true
    ? getCoinCheckForTarget(pendingOpponentTarget.effects, target)
    : null) ?? target.attackCoinCheck,

// Ses attaques infligent X dégâts de moins pendant son prochain tour.
...getOutgoingReductionForTarget(
  target.preventAllAttackDamageAndEffects !== true ? pendingOpponentTarget.effects : undefined,
  target
),
    },
    pendingOpponentTarget.effects,
    target.preventAllAttackDamageAndEffects === true
  ),
};

  const survivorRetaliationText = applyRetaliation(survivorBoard);

  setBoard(survivorBoard);

  setMessage(`${target.card.name} subit ${pendingDamage} dégâts.${survivorRetaliationText}`);

  setPendingOpponentTarget(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  return true;
}
