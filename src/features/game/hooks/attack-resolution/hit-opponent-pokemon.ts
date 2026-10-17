import { getKOPenalty, getPokemonMaxHp } from '@/features/game/rules';
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
    resolvedAttack,
    selectedPokemonCell,
    targetCell,
    totalDamage,
  } = locals;
  const target = board[targetCell];

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
  // Dégâts de l'attaque avant
  // les protections de la cible
  const fixedDamage = attack.fixedDamage;

  const isFixedDamageAttack = fixedDamage !== undefined;

  
  // Bonus de dégâts subi au prochain tour
  // après une attaque comme Grincement de Persian.
  const ExtraDamage =
    target.extraDamageNextTurnReady &&
    target.extraDamageNextTurnSourcePlayer === attacker.owner
      ? (target.extraDamageNextTurn ?? 0)
      : 0;

  let attackDamage: number =
    (fixedDamage ?? totalDamage + opponentBenchBonus) +
    ExtraDamage;


  // Bonus contre Pokémon évolué
  if (
    !isFixedDamageAttack &&
    attack.bonusDamageIfTargetEvolved &&
    target.card.stage !== 'base'
  ) {
    attackDamage += attack.bonusDamageIfTargetEvolved;
  }

  if (
    !isFixedDamageAttack &&
    attack.bonusDamageIfTargetNotEvolved &&
    target.card.stage === 'base'  
  ) {
    attackDamage += attack.bonusDamageIfTargetNotEvolved;
  }

  // Talent qui empêche les dégâts
 
const damagePrevented =
  temporaryAttackProtection ||
  doesTemporaryProtectionPreventDamage(
    target,
    attacker
  ) ||
  (!isFixedDamageAttack &&
    doesTalentPreventDamage(target, attacker));


  // Réduction de dégâts
  const activeDamageReduction = isFixedDamageAttack
    ? 0
    : target.attackDamageReductionEndPlayer === attacker.owner
      ? (target.attackDamageReduction ?? 0)
      : 0;


 
  // réduit les attaques des Pokémon Feu et Eau de 30 dégâts.
  const fireWaterTalentReduction =
    target.card.talent?.type === 'passive' &&
    target.card.talent.effect === 'reduceDamageFromFireWater' &&
    (attacker.card.type === 'feu' ||
      attacker.card.type === 'eau')
      ? (target.card.talent.amount ?? 30)
      : 0;


  // Dégâts finaux
  
  const damageToTarget = damagePrevented
    ? 0
    : isFixedDamageAttack
      ? Math.max(0, attackDamage)
      : Math.max(
          0,
          attackDamage - activeDamageReduction - fireWaterTalentReduction
        );


        
const targetProtectionMessage =
  temporaryAttackProtection
    ? `${target.card.name} est protégé et ne subit ni dégâts ni effets de cette attaque.`
    : doesTemporaryProtectionPreventDamage(target, attacker)
      ? `${target.card.name} évite les dégâts de ${attacker.card.name} grâce à sa protection temporaire.`
      : damagePrevented
        ? `${target.card.name} ne subit aucun dégât grâce à son Talent ${target.card.talent?.name}.`
        : `${attacker.card.name} utilise ${attack.name} sur ${target.card.name} : ${damageToTarget} dégâts.`;

  const hasDrainEffect =
    resolvedAttack.effects?.some(
      (effect: AttackEffect) => effect.type === 'healSelfByDamageDealt'
    ) ?? false;

  if (hasDrainEffect && damageToTarget > 0) {
    const currentAttacker = newBoard[selectedPokemonCell];

    if (currentAttacker) {
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

  const attackerAfterDrain = newBoard[selectedPokemonCell] ?? attackerAfterConfusion;

  const remainingHp = target.currentHp - damageToTarget;

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


      const benchFireWaterReduction =
        benchPokemon.card.talent?.type === 'passive' &&
        benchPokemon.card.talent.effect === 'reduceDamageFromFireWater' &&
        (attacker.card.type === 'feu' ||
          attacker.card.type === 'eau')
          ? (benchPokemon.card.talent.amount ?? 30)
          : 0;


      const actualBenchDamage = benchDamagePrevented
        ? 0
        : Math.max(0, benchSameTypeDamage - benchDamageReduction - benchFireWaterReduction);

      if (actualBenchDamage <= 0) {
        return;
      }

      const newBenchHp = benchPokemon.currentHp - actualBenchDamage;

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
      attackerAfterDrain,
      selectedPokemonCell
    );

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
        (attackerKO ? ` ${attacker.card.name} est également K.O. à cause du recul !` : '')
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
  };

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

  const attackerKO = handleAttackerKO(newBoard, attackerAfterDrain, selectedPokemonCell);

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

  // =====================================
  // PAS D'ÉCHANGE POSSIBLE
  // =====================================

  targetProtectionMessage +
      (damagedBenchPokemonNames.length > 0
        ? ` Pokémon de banc touchés : ${damagedBenchPokemonNames.join(', ')}.`
        : '') +
      (attackerKO ? ` ${attacker.card.name} est également K.O.` : '')
  
}
