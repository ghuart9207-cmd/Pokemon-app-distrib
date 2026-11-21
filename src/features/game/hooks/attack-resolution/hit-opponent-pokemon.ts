import { getKOPenalty, getPokemonMaxHp, getToolAttachedAttackBonus, getOpponentActiveSpecialConditionBonus, getTalentDamageReduction, getRetaliationDamage, isAttackDamagePreventedByEffect, isHealBlocked, getTargetTypeBonusDamage, doesTalentBurnAttacker, burnAttackingPokemon, getCoinCheckForTarget, doesToolAttackerShieldPreventDamage, getOutgoingReductionForTarget, hasScriptAttackFlag, hasScriptImmunity, revertImmuneConditions, } from '@/features/game/rules';
import type {
  Attack,
  AttackEffect,
  CoinSide,
  EnergyType,
  Player,
  PokemonCard,
  PokemonInPlay,
  TrainerCard,
} from '@/features/game/types';
import type { AttackResolutionContext } from './attack-resolution-context';
import { doesTemporaryProtectionPreventDamage } from
  '@/features/game/rules/temporary-attack-protection';
import { applyTargetRetreatBlock } from
  '@/features/game/rules/retreat-block-rules';
import { applyHandEnergyBlockFromAttack } from
  '@/features/game/rules';



/** Attaque qui touche le Pokémon adverse en face : dégâts, protections de la cible, K.O. et effets. */
export function hitOpponentPokemon(
  context: AttackResolutionContext,
  locals: {
    attack: Attack;
    attacker: PokemonInPlay;
    attackerAfterConfusion: {
      currentHp: number;
      card: PokemonCard;
      owner: Player;
      energies: EnergyType[];
      attachedTool: TrainerCard | null;
      hasAttacked: boolean;
      hasRetreated: boolean;
      isInvocation?: boolean | undefined;
      lastSwitchedTurnId?: number | undefined;
      poisoned: boolean;
      poisonSourcePlayer: Player | null;
      burned: boolean;
      burnSourcePlayer: Player | null;
      burnTriggersRemaining: number;
      paralyzed: boolean;
      paralysisTurnsRemaining: number;
      confused: boolean;
      confusionTurnsRemaining: number;
      asleep: boolean;
      sleepSourcePlayer: Player | null;
      sleepEndPlayer: Player | null;
      coinHistory: Partial<Record<number, CoinSide[]>>;
      extraDamageNextTurn?: number | undefined;
      extraDamageNextTurnSourcePlayer?: Player | null | undefined;
      extraDamageNextTurnReady?: boolean | undefined;
      blockedAttackName?: string | null | undefined;
      blockedAttackTurnId?: number | null | undefined;
      attackDamageReduction?: number | undefined;
      attackDamageReductionEndPlayer?: Player | null | undefined;
    };
    newBoard: { [x: string]: PokemonInPlay | null };
    opponentBenchBonus: number;
    opponentPlayerPoisoned?: boolean;
    resolvedAttack: Attack;
    selectedPokemonCell: string;
    targetCell: string;
    totalDamage: number;
  }
): void {
  const {
    board,
    doesTalentPreventAllAttackEffects,
    doesTalentPreventDamage,
    handleAttackerKO,
    prepareKOEnergyMove,
    setBoard,
    setMessage,
    setPendingOpponentActiveSwitch,
    setPendingSleepResolution,
    setPlayer1Damage,
    setPlayer1Discard,
    setPlayer1DiscardEnergies,
    setPlayer2Damage,
    setPlayer2Discard,
    setPlayer2DiscardEnergies,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
    startBenchOrPlayerDamageTarget,
    startKOSurvivalTalent,
    startPokemonCoinFlip,
  } = context;
  const {
    attack,
    attacker,
    attackerAfterConfusion,
    newBoard,
    opponentBenchBonus,
    opponentPlayerPoisoned,
    resolvedAttack,
    selectedPokemonCell,
    targetCell,
    totalDamage,
  } = locals;
  const target = newBoard[targetCell] ?? board[targetCell];

  if (!target) return;

 const temporaryAttackProtection =
  target.preventAllAttackDamageAndEffects ===
  true;

const attackEffectsPrevented =
  temporaryAttackProtection ||
  doesTalentPreventAllAttackEffects(
    target,
    attacker
  );


  // ==========================================
  // DÉFAUSSER TOUTES LES ÉNERGIES ET OUTILS
  // DES DEUX POKÉMON ACTIFS
  // ==========================================

  const discardBothActiveAttachmentsEffect =
    resolvedAttack.effects?.some(
      (effect) =>
        effect.type ===
        'discardAllEnergyAndToolsFromBothActives'
    ) ?? false;

  const discardAllAttachmentsAtCell = (
    cellName: string
  ) => {
    const pokemonAtCell = newBoard[cellName];

    if (!pokemonAtCell) return;

    const energiesToDiscard = [
      ...pokemonAtCell.energies,
    ];

    const toolToDiscard =
      pokemonAtCell.attachedTool;

    if (
      energiesToDiscard.length === 0 &&
      !toolToDiscard
    ) {
      return;
    }

    // Retirer les cartes attachées au Pokémon.
    newBoard[cellName] = {
      ...pokemonAtCell,
      energies: [],
      attachedTool: null,
    };

    // Défausser les Énergies et l'Outil
    // chez le propriétaire du Pokémon.
    if (pokemonAtCell.owner === 1) {
      if (energiesToDiscard.length > 0) {
        setPlayer1DiscardEnergies((previous) => [
          ...previous,
          ...energiesToDiscard,
        ]);
      }

      if (toolToDiscard) {
        setPlayer1Discard((previous) => [
          ...previous,
          toolToDiscard,
        ]);
      }
    } else {
      if (energiesToDiscard.length > 0) {
        setPlayer2DiscardEnergies((previous) => [
          ...previous,
          ...energiesToDiscard,
        ]);
      }

      if (toolToDiscard) {
        setPlayer2Discard((previous) => [
          ...previous,
          toolToDiscard,
        ]);
      }
    }
  };

  const applyDiscardBothActiveAttachmentsEffect = () => {
    if (!discardBothActiveAttachmentsEffect) return;

    // Le Pokémon qui attaque perd ses attaches.
    discardAllAttachmentsAtCell(selectedPokemonCell);

    // Le Pokémon défenseur perd les siennes,
    // sauf si un effet le protège des effets d'attaque.
    if (!attackEffectsPrevented) {
      discardAllAttachmentsAtCell(targetCell);
    }
  };


  // Dégâts de l'attaque avant
  // les protections de la cible
  const fixedDamage = attack.fixedDamage;

  const isFixedDamageAttack = fixedDamage !== undefined;

  
  // Bonus de dégâts subi au prochain tour
  // après une attaque comme Grincement de Persian.
  const ExtraDamage =
  target.extraDamageNextTurnReady &&
  target.extraDamageNextTurnSourcePlayer === attacker.owner &&
  (
    target.extraDamageNextTurnEnergyType == null ||
    target.extraDamageNextTurnEnergyType === attacker.card.type
  )
    ? (target.extraDamageNextTurn ?? 0)
    : 0;

  let attackDamage: number =
  (fixedDamage !== undefined
    ? fixedDamage +
      getToolAttachedAttackBonus(attacker, attack)
    : totalDamage + opponentBenchBonus) +
  ExtraDamage;
  attackDamage += getOpponentActiveSpecialConditionBonus(
  attacker,
  attack,
  board,
  selectedPokemonCell
);

  // BONUS DE 80 DÉGÂTS SI LA CIBLE EST EMPOISONNÉE
  const poisonedBonusEffect = resolvedAttack.effects?.find(
    (effect) => effect.type === 'bonusDamageIfTargetPoisoned'
  );

  if (
    !isFixedDamageAttack &&
    poisonedBonusEffect &&
    (
  target.poisoned === true ||
  opponentPlayerPoisoned === true
)
  ) {
    attackDamage += poisonedBonusEffect.amount;
  }


  // Bonus contre Pokémon évolué
  if (
    !isFixedDamageAttack &&
    attack.bonusDamageIfTargetEvolved &&
    target.card.stage !== 'base'
  ) {
    attackDamage += attack.bonusDamageIfTargetEvolved;
  }

  // Bonus contre un Pokémon-GX
  if (
    !isFixedDamageAttack &&
    attack.bonusDamageIfTargetGx &&
    target.card.variant === 'gx'
  ) {
    attackDamage += attack.bonusDamageIfTargetGx;
  }

  // Bonus selon le type du Pokémon ciblé (ex : +30 contre un Pokémon Eau).
  if (!isFixedDamageAttack) {
    attackDamage += getTargetTypeBonusDamage(resolvedAttack.effects, target);
  }


  if (
    !isFixedDamageAttack &&
    attack.bonusDamageIfTargetNotEvolved &&
    target.card.stage === 'base'  
  ) {
    attackDamage += attack.bonusDamageIfTargetNotEvolved;
  }

// BONUS DE DÉGÂTS SELON LE COÛT DE RETRAITE DE LA CIBLE
  const retreatCostBonusEffect = resolvedAttack.effects?.find(
    (effect) => effect.type === 'bonusDamagePerTargetRetreatCost'
  );

  if (!isFixedDamageAttack && retreatCostBonusEffect) {
    attackDamage +=
      target.card.retreatCost * retreatCostBonusEffect.amount;
  }

  // MOINS DE DÉGÂTS SELON LE COÛT DE RETRAITE DE LA CIBLE
  const retreatCostPenaltyEffect = resolvedAttack.effects?.find(
    (effect) => effect.type === 'reduceDamagePerTargetRetreatCost'
  );

  if (!isFixedDamageAttack && retreatCostPenaltyEffect) {
    attackDamage = Math.max(
      0,
      attackDamage - target.card.retreatCost * retreatCostPenaltyEffect.amount
    );
  }

  // Talent qui empêche les dégâts
 
const damagePrevented =
  
  temporaryAttackProtection ||
  isAttackDamagePreventedByEffect(target, attacker) ||
  doesTemporaryProtectionPreventDamage(
    target,
    attacker
  ) ||
  (!isFixedDamageAttack &&
    doesTalentPreventDamage(target, attacker));


  // Réduction de dégâts
  // L'attaque peut ignorer les réductions de dégâts de la cible.
const ignoresTargetDamageReduction =
  (resolvedAttack.effects?.some(
    (effect: AttackEffect) =>
      effect.type === 'ignoreTargetDamageReduction'
  ) ?? false) ||
  // Code des cartes : attackIgnoresReductions
  hasScriptAttackFlag(resolvedAttack, 'attackIgnoresReductions', {
    board,
    player: attacker.owner,
    sourceCell: selectedPokemonCell,
    player1Discard: context.player1Discard,
    player2Discard: context.player2Discard,
    player1Hand: context.player1Hand,
    player2Hand: context.player2Hand,
    player1DiscardEnergies: context.player1DiscardEnergies,
    player2DiscardEnergies: context.player2DiscardEnergies,
  });

// Réduction de dégâts, notamment celle de Frison.
const activeDamageReduction =
  isFixedDamageAttack || ignoresTargetDamageReduction
    ? 0
    : target.attackDamageReductionEndPlayer === attacker.owner
      ? (target.attackDamageReduction ?? 0)
      : 0;

  // Talents de réduction : Azumarill (Feu/Eau -30)
  // ou « subit 30 dégâts de moins provenant des attaques ».
  const fireWaterTalentReduction = ignoresTargetDamageReduction
    ? 0
    : getTalentDamageReduction(target, attacker, board);

  // Dégâts finaux
  
  const damageToTarget = damagePrevented
    ? 0
    : isFixedDamageAttack
      ? Math.max(0, attackDamage)
      : Math.max(
          0,
          attackDamage - activeDamageReduction - fireWaterTalentReduction
        );

  // Code des cartes : dégâts infligés par cette attaque (per / if : count 'damageDealt').
  {
    const attackerNow = newBoard[selectedPokemonCell];
    if (attackerNow) newBoard[selectedPokemonCell] = { ...attackerNow, lastAttackDamage: damageToTarget };
  }


        
const targetProtectionMessage =
  temporaryAttackProtection
    ? `${target.card.name} est protégé et ne subit ni dégâts ni effets de cette attaque.`
    : isAttackDamagePreventedByEffect(target, attacker)
      ? `${target.card.name} évite tous les dégâts de ${attacker.card.name} grâce à son attaque précédente.`
    : doesTemporaryProtectionPreventDamage(target, attacker)
      ? `${target.card.name} évite les dégâts de ${attacker.card.name} grâce à sa protection temporaire.`
      : damagePrevented
        ? hasScriptImmunity(target, 'damage', attacker, board)
          ? `${target.card.name} est immunisé : il ne subit aucun dégât de ${attacker.card.name}.`
        : doesToolAttackerShieldPreventDamage(target, attacker, board)
          ? `${target.card.name} ne subit aucun dégât : un Talent allié protège ses Pokémon Métal des attaquants avec un Outil.`
          : `${target.card.name} ne subit aucun dégât grâce à son Talent ${target.card.talent?.name}.`
        : `${attacker.card.name} utilise ${attack.name} sur ${target.card.name} : ${damageToTarget} dégâts.`;

  const hasDrainEffect =
    resolvedAttack.effects?.some(
      (effect: AttackEffect) => effect.type === 'healSelfByDamageDealt'
    ) ?? false;

  if (hasDrainEffect && damageToTarget > 0) {
    const currentAttacker = newBoard[selectedPokemonCell];

    if (currentAttacker && !isHealBlocked(currentAttacker)) {
      const attackerMaxHp = getPokemonMaxHp(currentAttacker);

      newBoard[selectedPokemonCell] = {
        ...currentAttacker,

        currentHp: Math.min(
          attackerMaxHp,

          currentAttacker.currentHp + damageToTarget
        ),
      };
    }
  }

  // --------------------------------
  // ÉCHANGER TOUS LES MARQUEURS DE DÉGÂTS
  // de l'attaquant avec ceux du Pokémon actif adverse
  // (après les dégâts de l'attaque ; ce ne sont pas des dégâts d'attaque).
  // --------------------------------
  const swapCountersEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find(
        (effect: AttackEffect) => effect.type === 'swapDamageCountersWithOpponentActive'
      );
  const hpAfterAttackDamage = target.currentHp - damageToTarget;
  let swappedTargetHp: number | null = null;
  let swapText = '';

  if (swapCountersEffect && hpAfterAttackDamage > 0) {
    const attackerBeforeSwap = newBoard[selectedPokemonCell] ?? attackerAfterConfusion;
    const attackerMaxHp = getPokemonMaxHp(attackerBeforeSwap);
    const targetMaxHp = getPokemonMaxHp(target);

    const attackerDamageTaken = Math.max(0, attackerMaxHp - attackerBeforeSwap.currentHp);
    const targetDamageTaken = Math.max(0, targetMaxHp - hpAfterAttackDamage);

    newBoard[selectedPokemonCell] = {
      ...attackerBeforeSwap,
      currentHp: attackerMaxHp - targetDamageTaken,
    };
    swappedTargetHp = targetMaxHp - attackerDamageTaken;

    swapText =
      ` Échange des marqueurs : ${attacker.card.name} a maintenant ${targetDamageTaken} dégâts` +
      ` et ${target.card.name} ${attackerDamageTaken} dégâts.`;
  }

  const attackerAfterDrain = newBoard[selectedPokemonCell] ?? attackerAfterConfusion;

  // --------------------------------
  // « Si le Pokémon actif de votre adversaire est un Pokémon de Base,
  // il est mis K.O. » (sauf s'il est protégé des effets de l'attaque)
  // --------------------------------
  const knockOutBaseEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find(
        (effect: AttackEffect) => effect.type === 'knockOutIfOpponentActiveIsBase'
      );
  const knockedOutByEffect = !!knockOutBaseEffect && target.card.stage === 'base';

  if (knockedOutByEffect) {
    swapText += ` ${target.card.name} est un Pokémon de Base : il est mis K.O. !`;
  }

  const remainingHp = knockedOutByEffect
    ? Math.min(0, swappedTargetHp ?? hpAfterAttackDamage)
    : (swappedTargetHp ?? hpAfterAttackDamage);

  // Contre-coup éventuel de la cible (et des Pokémon de banc touchés).
  let retaliationTotal = getRetaliationDamage(target, attacker, damageToTarget);

  // --------------------------------
  // DÉGÂTS AUX POKÉMON DE BANC
  // AYANT LE MÊME TYPE QUE LA CIBLE
  // --------------------------------

  const benchSameTypeDamage = attack.benchDamageSameTypeAsTarget ?? 0;

  const damagedBenchPokemonNames: string[] = [];

  if (benchSameTypeDamage > 0) {
    Object.entries(board).forEach(([benchCell, benchPokemon]) => {
      if (!benchPokemon) {
        return;
      }

      // Ce doit être un Pokémon adverse
      if (benchPokemon.owner !== target.owner) {
        return;
      }

      // Le Pokémon qui reçoit
      // l'attaque principale n'est
      // PAS un Pokémon de banc
      if (benchCell === targetCell) {
        return;
      }

      // Même type que le Pokémon actif
      if (benchPokemon.card.type !== target.card.type) {
        return;
      }

      // --------------------------------
      // PROTECTIONS CONTRE LES DÉGÂTS
      // --------------------------------

      const benchTemporaryAttackProtection =
  benchPokemon
    .preventAllAttackDamageAndEffects ===
  true;


const benchDamagePrevented =
  benchTemporaryAttackProtection ||
  isAttackDamagePreventedByEffect(benchPokemon, attacker) ||
  doesTemporaryProtectionPreventDamage(
    benchPokemon,
    attacker
  ) ||
  doesTalentPreventDamage(
    benchPokemon,
    attacker
  );


      const benchDamageReduction =
        benchPokemon.attackDamageReductionEndPlayer === attacker.owner
          ? (benchPokemon.attackDamageReduction ?? 0)
          : 0;


      const benchFireWaterReduction = getTalentDamageReduction(
        benchPokemon,
        attacker,
        board
      );


      const actualBenchDamage = benchDamagePrevented
        ? 0
        : Math.max(0, benchSameTypeDamage - benchDamageReduction - benchFireWaterReduction);

      if (actualBenchDamage <= 0) {
        return;
      }

      retaliationTotal += getRetaliationDamage(benchPokemon, attacker, actualBenchDamage);

      const benchHpBeforeAttack =
  newBoard[benchCell]?.currentHp ?? benchPokemon.currentHp;

const newBenchHp = benchHpBeforeAttack - actualBenchDamage;

      damagedBenchPokemonNames.push(`${benchPokemon.card.name} (-${actualBenchDamage})`);

      // ------------------------------
      // K.O. DU POKÉMON DE BANC
      // ------------------------------

      if (newBenchHp <= 0) {
        const penalty = getKOPenalty(benchPokemon.card.stage, benchPokemon.card.variant);

        newBoard[benchCell] = null;

        prepareKOEnergyMove(benchPokemon, newBoard);

        if (benchPokemon.owner === 1) {
          setPlayer1Damage((damage) => damage + penalty);

          setPlayer1DiscardEnergies((discard) => [...discard, ...benchPokemon.energies]);

          setPlayer1Discard((discard) => [
            ...discard,
            benchPokemon.card,

            ...(benchPokemon.attachedTool ? [benchPokemon.attachedTool] : []),
          ]);
        } else {
          setPlayer2Damage((damage) => damage + penalty);

          setPlayer2DiscardEnergies((discard) => [...discard, ...benchPokemon.energies]);

          setPlayer2Discard((discard) => [
            ...discard,
            benchPokemon.card,

            ...(benchPokemon.attachedTool ? [benchPokemon.attachedTool] : []),
          ]);
        }

        return;
      }

      // Le Pokémon de banc survit
      newBoard[benchCell] = {
        ...benchPokemon,
        currentHp: newBenchHp,
      };
    });
  }

  // --------------------------------
  // CONTRE-COUP : MARQUEURS SUR L'ATTAQUANT
  // (même si la cible est mise K.O.)
  // --------------------------------
  const attackerOnBoard = newBoard[selectedPokemonCell];

  if (retaliationTotal > 0 && attackerOnBoard) {
    newBoard[selectedPokemonCell] = {
      ...attackerOnBoard,
      currentHp: attackerOnBoard.currentHp - retaliationTotal,
    };
  }

  // Talent du défenseur actif : l'attaquant est maintenant Brûlé.
  const burnsAttacker = doesTalentBurnAttacker(target, targetCell, board, attacker, damageToTarget);
  const attackerToBurn = newBoard[selectedPokemonCell];

  if (burnsAttacker && attackerToBurn) {
    newBoard[selectedPokemonCell] = burnAttackingPokemon(attackerToBurn);
  }

  const attackerForKO =
    retaliationTotal > 0
      ? newBoard[selectedPokemonCell] ?? {
          ...attackerAfterDrain,
          currentHp: attackerAfterDrain.currentHp - retaliationTotal,
        }
      : attackerAfterDrain;

  const retaliationText =
    swapText +
    (retaliationTotal > 0
      ? ` Contre-coup : ${attacker.card.name} reçoit ${retaliationTotal / 10} marqueurs de dégâts (${retaliationTotal}).`
      : '') +
    (burnsAttacker && attackerToBurn
      ? ` ${target.card.talent?.name ?? 'Talent'} : ${attacker.card.name} est maintenant Brûlé !`
      : '');

  // K.O.
  if (remainingHp <= 0) {
    if (
      startKOSurvivalTalent(
        {
          ...target,

          currentHp: remainingHp,
        },

        targetCell,

        newBoard
      )
    ) {
      // Le contre-coup s'applique même si la cible tente de survivre.
      if (retaliationTotal > 0) {
        handleAttackerKO(newBoard, attackerForKO, selectedPokemonCell);
      }
      applyDiscardBothActiveAttachmentsEffect();
      setBoard(newBoard);
      setSelectedPokemonCell(null);
      setSelectedAttackIndex(null);

      return;
    }
    const penalty = getKOPenalty(target.card.stage, target.card.variant);

    newBoard[targetCell] = null;

    prepareKOEnergyMove(target, newBoard);

    if (target.owner === 1) {
      setPlayer1Damage((damage) => damage + penalty);

      setPlayer1DiscardEnergies((discard) => [...discard, ...target.energies]);

      setPlayer1Discard((discard) => [
        ...discard,
        target.card,
        ...(target.attachedTool ? [target.attachedTool] : []),
      ]);
    } else {
      setPlayer2Damage((damage) => damage + penalty);

      setPlayer2DiscardEnergies((discard) => [...discard, ...target.energies]);

      setPlayer2Discard((discard) => [
        ...discard,
        target.card,
        ...(target.attachedTool ? [target.attachedTool] : []),
      ]);
    }
    const attackerKO = handleAttackerKO(
      newBoard,
      attackerForKO,
      selectedPokemonCell
    );
applyDiscardBothActiveAttachmentsEffect();
    setBoard(newBoard);
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    if (
      startBenchOrPlayerDamageTarget(attacker, selectedPokemonCell, attack, targetCell)
    ) {
      setMessage(
        `${target.card.name} est K.O. Choisis maintenant un Pokémon de banc adverse ou la carte du joueur adverse pour les 30 dégâts supplémentaires.`
      );

      return;
    }

    setMessage(
      `${attacker.card.name} utilise ${attack.name} ! ` +
        `${target.card.name} subit ${damageToTarget} dégâts et est K.O. ! ` +
        `Le joueur ${target.owner} reçoit +${penalty} dégâts.` +
        (damagedBenchPokemonNames.length > 0
          ? ` Pokémon de banc touchés : ${damagedBenchPokemonNames.join(', ')}.`
          : '') +
        retaliationText +
        (attackerKO ? ` ${attacker.card.name} est également K.O. !` : '')
    );

    return;
  }

  const poisonEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find((effect) => effect.type === 'poison');

  const burnEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find((effect) => effect.type === 'burn');

  const paralysisEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find((effect) => effect.type === 'paralyze');

  const confusionEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find((effect) => effect.type === 'confuse');

  const sleepEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find((effect) => effect.type === 'sleep');

  

  const extraDamageNextTurnEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find((effect) => effect.type === 'takeExtraDamageNextTurn');
  // Le Pokémon survit
  newBoard[targetCell] = {
    ...target,
    currentHp: remainingHp,

    extraDamageNextTurn: extraDamageNextTurnEffect
      ? extraDamageNextTurnEffect.amount
      : target.extraDamageNextTurn,

    extraDamageNextTurnEnergyType: extraDamageNextTurnEffect
      ? extraDamageNextTurnEffect.energyType
      : target.extraDamageNextTurnEnergyType,

    extraDamageNextTurnSourcePlayer: extraDamageNextTurnEffect
      ? attacker.owner
      : target.extraDamageNextTurnSourcePlayer,

    extraDamageNextTurnReady: extraDamageNextTurnEffect
      ? false
      : target.extraDamageNextTurnReady,

    // POISON
    poisoned: poisonEffect ? true : target.poisoned,

    poisonSourcePlayer: poisonEffect ? attacker.owner : target.poisonSourcePlayer,

    // BRÛLURE
    burned: burnEffect ? true : target.burned,

    burnSourcePlayer: burnEffect ? attacker.owner : target.burnSourcePlayer,

    burnTriggersRemaining: burnEffect ? 2 : target.burnTriggersRemaining,

    paralyzed: paralysisEffect ? true : target.paralyzed,

    paralysisTurnsRemaining: paralysisEffect ? 1 : target.paralysisTurnsRemaining,

    confused: confusionEffect ? true : target.confused,

    confusionTurnsRemaining: confusionEffect ? 2 : target.confusionTurnsRemaining,

    // Ne peut pas être soigné pendant le prochain tour de son propriétaire.
    healBlockedEndPlayer:
      !attackEffectsPrevented &&
      resolvedAttack.effects?.some(
        (effect) => effect.type === 'preventTargetHealingNextOpponentTurn'
      )
        ? target.owner
        : target.healBlockedEndPlayer,

    // S'il attaque pendant son prochain tour : lancer de pièces avant.
    attackCoinCheck: getCoinCheckForTarget(attackEffectsPrevented ? undefined : resolvedAttack.effects, target) ?? target.attackCoinCheck,

    // Ses attaques infligent X dégâts de moins pendant son prochain tour.
    ...getOutgoingReductionForTarget(attackEffectsPrevented ? undefined : resolvedAttack.effects, target),
  };


// Code des cartes : immunités contre les états spéciaux.
const targetAfterConditions = newBoard[targetCell];

if (targetAfterConditions) {
  newBoard[targetCell] = revertImmuneConditions(target, targetAfterConditions, attacker, board);
}

// Interdiction de retraite sur le Pokémon touché.
const updatedTarget = newBoard[targetCell];

if (updatedTarget) {
  newBoard[targetCell] = applyTargetRetreatBlock(
    updatedTarget,
    resolvedAttack.effects,
    attackEffectsPrevented
  );
}


// Bloquer les énergies de la main
// pour le Pokémon défenseur.
const currentTarget = newBoard[targetCell];

if (currentTarget) {
  newBoard[targetCell] = applyHandEnergyBlockFromAttack(
    currentTarget,
    resolvedAttack.effects,
    attackEffectsPrevented
  );
}


  // DÉFAUSSER DES ÉNERGIES DU POKÉMON ACTIF ADVERSE
  const discardOpponentActiveEnergyEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find(
        (effect) => effect.type === 'discardOpponentActiveEnergy'
      );

  const targetAfterAttack = newBoard[targetCell];

  if (
    discardOpponentActiveEnergyEffect &&
    targetAfterAttack &&
    targetAfterAttack.energies.length > 0
  ) {
    const numberToDiscard = Math.min(
      discardOpponentActiveEnergyEffect.amount,
      targetAfterAttack.energies.length
    );

    // Retire les dernières Énergies attachées.
    const discardedEnergies = targetAfterAttack.energies.slice(
      targetAfterAttack.energies.length - numberToDiscard
    );

    newBoard[targetCell] = {
      ...targetAfterAttack,
      energies: targetAfterAttack.energies.slice(
        0,
        targetAfterAttack.energies.length - numberToDiscard
      ),
    };

    // Les Énergies vont dans la défausse de leur propriétaire.
    if (targetAfterAttack.owner === 1) {
      setPlayer1DiscardEnergies((discard) => [
        ...discard,
        ...discardedEnergies,
      ]);
    } else {
      setPlayer2DiscardEnergies((discard) => [
        ...discard,
        ...discardedEnergies,
      ]);
    }
  }


  // -----------------------------------------
  // DÉFAUSSER L'OUTIL DU POKÉMON ACTIF ADVERSE
  // -----------------------------------------
  let toolDiscardText = '';

  const discardToolEffect = attackEffectsPrevented
    ? undefined
    : resolvedAttack.effects?.find((effect) => effect.type === 'discardOpponentActiveTool');

  const targetBeforeToolDiscard = newBoard[targetCell];

  if (discardToolEffect && targetBeforeToolDiscard?.attachedTool) {
    const tool = targetBeforeToolDiscard.attachedTool;
    const withoutTool = { ...targetBeforeToolDiscard, attachedTool: null };

    // Un Outil peut augmenter les PV maximum (ex : +40) :
    // les dégâts déjà subis restent, donc les PV restants baissent d'autant.
    const lostMaxHp =
      getPokemonMaxHp(targetBeforeToolDiscard) - getPokemonMaxHp(withoutTool);
    const hpAfterToolLoss = withoutTool.currentHp - Math.max(0, lostMaxHp);

    // L'Outil va dans la défausse de son propriétaire.
    if (targetBeforeToolDiscard.owner === 1) {
      setPlayer1Discard((discard) => [...discard, tool]);
    } else {
      setPlayer2Discard((discard) => [...discard, tool]);
    }

    toolDiscardText = ` ${tool.name} de ${targetBeforeToolDiscard.card.name} est défaussé.`;

    if (hpAfterToolLoss > 0) {
      newBoard[targetCell] = { ...withoutTool, currentHp: hpAfterToolLoss };
    } else {
      // Plus assez de PV sans l'Outil : K.O.
      const penalty = getKOPenalty(withoutTool.card.stage, withoutTool.card.variant);
      newBoard[targetCell] = null;

      if (withoutTool.owner === 1) {
        setPlayer1Damage((damage) => damage + penalty);
        setPlayer1Discard((discard) => [...discard, withoutTool.card]);
        setPlayer1DiscardEnergies((discard) => [...discard, ...withoutTool.energies]);
      } else {
        setPlayer2Damage((damage) => damage + penalty);
        setPlayer2Discard((discard) => [...discard, withoutTool.card]);
        setPlayer2DiscardEnergies((discard) => [...discard, ...withoutTool.energies]);
      }

      toolDiscardText += ` Sans son Outil, ${withoutTool.card.name} est K.O. ! Le joueur ${withoutTool.owner} reçoit +${penalty} dégâts.`;
    }
  }

  const forceOpponentSwitchEffect = resolvedAttack.effects?.find(
    (effect) => effect.type === 'forceOpponentActiveSwitch'
  );

  const hasOpponentBenchPokemon = forceOpponentSwitchEffect
    ? Object.entries(newBoard).some(
        ([cellName, pokemon]) =>
          pokemon !== null && pokemon.owner === target.owner && cellName !== targetCell
      )
    : false;

  if (sleepEffect && remainingHp > 0) {
    setPendingSleepResolution({
      sourceCell: selectedPokemonCell,
      targetCell,
      sourcePlayer: attacker.owner,
    });

    startPokemonCoinFlip(selectedPokemonCell, 1);
  }

  const attackerKO = handleAttackerKO(newBoard, attackerForKO, selectedPokemonCell);
  applyDiscardBothActiveAttachmentsEffect();
  setBoard(newBoard);

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  // =====================================
  // EFFET DE SCARHINO :
  // L'ADVERSAIRE ÉCHANGE SON POKÉMON
  // =====================================

  
if (
  forceOpponentSwitchEffect &&
  hasOpponentBenchPokemon &&
  !attackEffectsPrevented
) {
  setPendingOpponentActiveSwitch({
    player: target.owner,
    activeCell: targetCell,
  });

  setMessage(
    targetProtectionMessage +
      ` Joueur ${target.owner}, choisis maintenant ` +
      `l'un de tes Pokémon de banc pour remplacer ` +
      `${target.card.name}.`
  );

  return;
}

// -----------------------------------------
// DÉGÂTS SUPPLÉMENTAIRES DE TIR TORNADE
// SI LA CIBLE PRINCIPALE SURVIT
// -----------------------------------------

if (
  startBenchOrPlayerDamageTarget(
    attacker,
    selectedPokemonCell,
    attack,
    targetCell
  )
) {
  const secondaryDamage =
    attack.secondaryBenchOrPlayerDamage ?? 0;

  setMessage(
    `${targetProtectionMessage}${toolDiscardText}${retaliationText} Choisis une autre cible adverse : le joueur adverse ou un autre Pokémon adverse, pour les ${secondaryDamage} dégâts supplémentaires.`
  );

  return;
}

  // =====================================
  // PAS D'ÉCHANGE POSSIBLE
  // =====================================

  // (Correctif : ce message n'était jamais affiché, setMessage manquait.)
  setMessage(
    targetProtectionMessage +
      (damagedBenchPokemonNames.length > 0
        ? ` Pokémon de banc touchés : ${damagedBenchPokemonNames.join(', ')}.`
        : '') +
      toolDiscardText +
      retaliationText +
      (attackerKO ? ` ${attacker.card.name} est également K.O.` : '')
  );

}
