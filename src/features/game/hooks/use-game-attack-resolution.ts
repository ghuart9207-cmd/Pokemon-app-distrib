import {
  applyAttackEffects,
  getAttackWithBaseDamageOverride,
  calculateCoinDamage,
  canPayAttackCost,
  canPayTypedDiscard,
  doesAttackFailFromCoin,
  getCoinTriggeredEffects,
  getKOPenalty,
  getPokemonMaxHp,
  getToolAttachedAttackBonus,
} from '@/features/game/rules';
import type {
  Attack,
  AttackEffect,
  CoinSide,
  EnergyType,
  Player,
  PendingEnergyTransferToBench,
} from '@/features/game/types';
import { formatAttackCost } from '@/features/game/utils/card-labels';
import type { AttackResolutionContext } from './attack-resolution/attack-resolution-context';
import { healAllAndReturnToHand } from './attack-resolution/heal-all-and-return-to-hand';
import { hitOpponentPokemon } from './attack-resolution/hit-opponent-pokemon';
import { hitEveryoneIgnoringEffects } from './attack-resolution/hit-everyone-ignoring-effects';
import { resolveFailedAttack } from './attack-resolution/resolve-failed-attack';
import { startBenchEnergyAttachment } from './attack-resolution/start-bench-energy-attachment';
import { startFreeTargetAttack } from './attack-resolution/start-free-target-attack';
import { getOpponentActiveEnergyBonusDamage } from  '@/features/game/rules/attack-rules';
import { getDamagePerAttachedEnergy } from  '@/features/game/rules/attack-rules';
import { useState } from 'react';
import { hitPokemonWithTalent } from './attack-resolution/hit-pokemon-with-talent';
import { getAvailablePokemonAttacks } from '@/features/game/utils/available-pokemon-attacks';
import { ALL_POKEMON_CARDS } from '@/features/game/data';

export function useGameAttackResolution(options: AttackResolutionContext) {
    const [pendingDiscardAllEnergyChoice, setPendingDiscardAllEnergyChoice] =
    useState<{
      pokemonName: string;
      bonusDamage: number;
      coinResult?: CoinSide[];
      optionalBonusDamageChoice?: boolean;
      ownBenchDamageTargetCell?: string;
    } | null>(null);
    const [pendingOptionalBonusDamageChoice, setPendingOptionalBonusDamageChoice] =
  useState<{
    pokemonName: string;
    bonusDamage: number;
    benchDamage: number;
    coinResult?: CoinSide[];
    owner: Player;
    attackerCell: string;
    stage: 'choice' | 'target';
    discardAllEnergyChoice?: boolean;
  } | null>(null);
  const [pendingOptionalAttackEffect, setPendingOptionalAttackEffect] =
  useState<{
    pokemonName: string;
    message: string;
    effectType: AttackEffect['type'];
    player: Player;
    attackerCell: string;
  } | null>(null);
  const {
    advanceAttackOrder,
    applyAttackStatusToPlayer,
    board,
    
    player1Status,
    player2Status,

    setPlayer1Status,
    setPlayer2Status,

    canAttackInCurrentOrder,
    currentPlayer,
    handleAttackerKO,
    player1Discard,
    player2Discard,
    player1DiscardEnergies,
    player2DiscardEnergies,
    round,
    selectedAttackIndex,
    selectedPokemonCell,
    setBoard,
    setHasAttackedThisTurn,
    setMessage,
    setPendingBenchEnergyAttachment,
    setPendingEnergyTransferToBench,
    setPendingAttackSummonPlacement,
    setPendingPokemonSwitch,
    setPlayer1Damage,
    setPlayer1DiscardEnergies,
    setPlayer2Damage,
    setPlayer2DiscardEnergies,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
    startBenchOrPlayerDamageTarget,
    prepareKOEnergyMove,

    setPlayer1Discard,
    setPlayer2Discard, 
    turnId,
  } = options;

  function attackSelectedPokemon(
  coinResult?: CoinSide[],
  discardAllEnergyChoice?: boolean,
  optionalBonusDamageChoice?: boolean,
  ownBenchDamageTargetCell?: string
) {
    if (!selectedPokemonCell) return;

    if (!canAttackInCurrentOrder(selectedPokemonCell)) {
      setMessage(
        `${selectedPokemonCell} ne peut plus attaquer dans l'ordre choisi ce tour.`
      );
      return;
    }

    const attacker = board[selectedPokemonCell];

    if (!attacker) return;


if (attacker.blockedAllAttacksTurnId === turnId) {
  setMessage(
    `${attacker.card.name} ne peut pas attaquer pendant ce tour à cause de son attaque précédente.`
  );
  return;
}


    if (attacker.asleep) {
      setMessage(`${attacker.card.name} est endormi et ne peut pas attaquer.`);
      return;
    }

    if (attacker.owner !== currentPlayer) {
      return;
    }

    if (attacker.paralyzed) {
      setMessage(
        `${attacker.card.name} est paralysé et ne peut pas attaquer pendant ce tour.`
      );
      return;
    }

    if (attacker.hasAttacked) {
      setMessage(`${attacker.card.name} a déjà attaqué pendant ce tour.`);
      return;
    }

    if (selectedAttackIndex === null) {
      setMessage(`Choisis d'abord une attaque de ${attacker.card.name}.`);
      return;
    }

    const discardForAttackList =
  attacker.owner === 1 ? player1Discard : player2Discard;

const selectedAttack = getAvailablePokemonAttacks(
  attacker,
  discardForAttackList
)[selectedAttackIndex]?.attack;

if (!selectedAttack) {
  setMessage("Cette attaque n'existe pas.");
  return;
}

const attack = getAttackWithBaseDamageOverride(
  attacker,
  selectedAttack,
  turnId
);
    if (coinResult) {
      const resultText = coinResult
        .map((side) => (side === 'face' ? 'FACE' : 'PILE'))
        .join(' / ');

      console.log('Résultat du lancer :', resultText);
    }

    const coinTriggeredEffects = getCoinTriggeredEffects(attack, coinResult);

    const resolvedAttack: Attack = {
      ...attack,

      effects: [...(attack.effects ?? []), ...coinTriggeredEffects],
    };

    const discardAllEnergyForBonusEffect = resolvedAttack.effects?.find(
  (effect) => effect.type === 'discardAllEnergyForBonus'
);
const optionalBonusDamageEffect = resolvedAttack.effects?.find(
  (effect) => effect.type === 'optionalBonusDamageAndOwnBenchDamage'
);

let useOptionalBonusDamage = optionalBonusDamageChoice;
if (
  discardAllEnergyForBonusEffect &&
  discardAllEnergyChoice === undefined
) {
  if (!canPayAttackCost(attacker.energies, attack)) {
    setMessage(
      `${attacker.card.name} n'a pas les Énergies nécessaires pour cette attaque.`
    );
    return;
  }

  if (!canPayTypedDiscard(attacker.energies, attack)) {
    setMessage(
      `${attacker.card.name} ne possède pas les Énergies nécessaires pour cette attaque.`
    );
    return;
  }

      setPendingDiscardAllEnergyChoice({
      pokemonName: attacker.card.name,
      bonusDamage: discardAllEnergyForBonusEffect.amount,
      coinResult,
      optionalBonusDamageChoice,
      ownBenchDamageTargetCell,
    });

  return;
}
const hasOwnBenchPokemon = Object.entries(board).some(
  ([cellName, pokemon]) =>
    pokemon !== null &&
    pokemon.owner === attacker.owner &&
    cellName !== selectedPokemonCell
);

// Demander si le joueur souhaite utiliser le bonus.
if (optionalBonusDamageEffect && useOptionalBonusDamage === undefined) {
  if (!hasOwnBenchPokemon) {
    // Pas de Pokémon de banc : l'attaque continue sans bonus.
    useOptionalBonusDamage = false;
  } else {
    if (!canPayAttackCost(attacker.energies, attack)) {
      setMessage(
        `${attacker.card.name} n'a pas les Énergies nécessaires pour cette attaque.`
      );
      return;
    }

    if (!canPayTypedDiscard(attacker.energies, attack)) {
      setMessage(
        `${attacker.card.name} ne possède pas les Énergies nécessaires pour cette attaque.`
      );
      return;
    }

    setPendingOptionalBonusDamageChoice({
      pokemonName: attacker.card.name,
      bonusDamage: optionalBonusDamageEffect.amount,
      benchDamage: optionalBonusDamageEffect.amount,
      coinResult,
      owner: attacker.owner,
      attackerCell: selectedPokemonCell,
      stage: 'choice',
      discardAllEnergyChoice,
    });

    setMessage(
      `Veux-tu infliger ${optionalBonusDamageEffect.amount} dégâts supplémentaires ? Un de tes Pokémon de banc subira autant de dégâts.`
    );

    return;
  }
}

// Si le joueur a choisi OUI, vérifier le Pokémon de banc sélectionné.
if (optionalBonusDamageEffect && useOptionalBonusDamage === true) {
  const selectedOwnBenchPokemon = ownBenchDamageTargetCell
    ? board[ownBenchDamageTargetCell]
    : null;

  if (
    !selectedOwnBenchPokemon ||
    selectedOwnBenchPokemon.owner !== attacker.owner ||
    ownBenchDamageTargetCell === selectedPokemonCell
  ) {
    if (!hasOwnBenchPokemon) {
      useOptionalBonusDamage = false;
    } else {
      setPendingOptionalBonusDamageChoice({
        pokemonName: attacker.card.name,
        bonusDamage: optionalBonusDamageEffect.amount,
        benchDamage: optionalBonusDamageEffect.amount,
        coinResult,
        owner: attacker.owner,
        attackerCell: selectedPokemonCell,
        stage: 'target',
        discardAllEnergyChoice,
      });

      setMessage(
        `Choisis un de tes Pokémon de banc qui subira ${optionalBonusDamageEffect.amount} dégâts.`
      );

      return;
    }
  }
}
    const switchEffect = resolvedAttack.effects?.find(
      (effect) => effect.type === 'switchWithBench'
    );

    const benchEnergyEffect = resolvedAttack.effects?.find(
      (effect) => effect.type === 'recoverEnergyToBench' && effect.energyType
    );

    // --------------------------------
    // DÉFAUSSE TOUTES LES ÉNERGIES
    // D'UN TYPE POUR AUGMENTER LES DÉGÂTS
    // --------------------------------

    const discardAllForBonusEffect = resolvedAttack.effects?.find(
      (effect) => effect.type === 'discardAllTypedEnergyForBonus' && effect.energyType
    );

    const energiesDiscardedForBonus = discardAllForBonusEffect?.energyType
      ? attacker.energies.filter(
          (energy) => energy === discardAllForBonusEffect.energyType
        )
      : [];

    const switchedRecently =
      attacker.lastSwitchedTurnId !== undefined &&
      (attacker.lastSwitchedTurnId === turnId ||
        attacker.lastSwitchedTurnId === turnId - 1);

    const switchedRecentlyBonus = switchedRecently
      ? (attack.bonusDamageIfSwitchedRecently ?? 0)
      : 0;

    const everyTwoRoundsBonus =
      Math.floor(round / 2) * (attack.bonusDamageEveryTwoRounds ?? 0);

      const ownDiscard =
  attacker.owner === 1
    ? player1Discard
    : player2Discard;

const discardCardBonus =
  attack.bonusDamagePerOwnDiscardCard
    ? ownDiscard.filter(
        (card) =>
          card.id ===
          attack
            .bonusDamagePerOwnDiscardCard!
            .cardId
      ).length *
      attack.bonusDamagePerOwnDiscardCard
        .amount
    : 0;

    const hasDamagePerAttachedEnergy = (resolvedAttack.effects ?? []).some(
  (effect) => effect.type === 'damagePerAttachedEnergy'
);

let totalDamage =
  (hasDamagePerAttachedEnergy
    ? getDamagePerAttachedEnergy(attacker, resolvedAttack)
    : calculateCoinDamage(attack, coinResult)) +
  switchedRecentlyBonus +
  everyTwoRoundsBonus +
  discardCardBonus;
  totalDamage += getToolAttachedAttackBonus(attacker, attack);

    if (discardAllForBonusEffect) {
      totalDamage += energiesDiscardedForBonus.length * discardAllForBonusEffect.amount;
    }

if (
  discardAllEnergyForBonusEffect &&
  discardAllEnergyChoice === true
) {
  totalDamage += discardAllEnergyForBonusEffect.amount;
}
const optionalBonusDamage =
  optionalBonusDamageEffect && useOptionalBonusDamage === true
    ? optionalBonusDamageEffect.amount
    : 0;

totalDamage += optionalBonusDamage;

// Si l'attaque utilise fixedDamage, le bonus doit aussi s'y ajouter.
const attackForDamage: Attack =
  optionalBonusDamage > 0 && attack.fixedDamage !== undefined
    ? {
        ...attack,
        fixedDamage: attack.fixedDamage + optionalBonusDamage,
      }
    : attack;
    const attackFailed = doesAttackFailFromCoin(attack, coinResult);
    if (switchEffect) {
      const attackerRow = selectedPokemonCell[0];

      const hasPokemonToSwitch = Object.entries(board).some(
        ([cellName, pokemon]) =>
          pokemon !== null &&
          pokemon.owner === attacker.owner &&
          cellName !== selectedPokemonCell &&
          cellName[0] === attackerRow
      );

      if (hasPokemonToSwitch) {
        setPendingPokemonSwitch({
          player: attacker.owner,
          attackerCell: selectedPokemonCell,
        });

        setMessage(
          `Choisis un Pokémon de la ligne ${attackerRow} avec lequel échanger ${attacker.card.name}.`
        );
      }
    }

    if (benchEnergyEffect && benchEnergyEffect.energyType) {
      const discardEnergies =
        attacker.owner === 1 ? player1DiscardEnergies : player2DiscardEnergies;

      const hasRequiredEnergy = discardEnergies.some(
        (energy) => energy === benchEnergyEffect.energyType
      );

      const hasBenchPokemon = Object.entries(board).some(
        ([cellName, pokemon]) =>
          pokemon !== null &&
          pokemon.owner === attacker.owner &&
          cellName !== selectedPokemonCell
      );

      if (hasRequiredEnergy && hasBenchPokemon) {
        setPendingBenchEnergyAttachment({
          player: attacker.owner,
          attackerCell: selectedPokemonCell,
          energyType: benchEnergyEffect.energyType,
          amount: benchEnergyEffect.amount,
        });

        setMessage(
          `Choisis un Pokémon de banc auquel attacher une Énergie ${benchEnergyEffect.energyType}.`
        );
      }
    }

    if (!attack) {
      setMessage("Cette attaque n'existe pas.");
      return;
    }

    if (!canPayAttackCost(attacker.energies, attack)) {
      setMessage(
        `${attacker.card.name} n'a pas les Énergies nécessaires. Coût : ${formatAttackCost(attack)}.`
      );

      return;
    }

    if (!canPayTypedDiscard(attacker.energies, attack)) {
      setMessage(
        `${attacker.card.name} doit pouvoir défausser les Énergies demandées par cette attaque.`
      );
      return;
    }

    setHasAttackedThisTurn(true);

    advanceAttackOrder(selectedPokemonCell, attacker.owner);

    if (attackFailed) {
      resolveFailedAttack(options, { attacker, selectedPokemonCell });

      return;
    }

    const healAllAndReturnEffect = resolvedAttack.effects?.find(
      (effect) => effect.type === 'healAllOwnAndReturnSelf'
    );

    if (healAllAndReturnEffect) {
      healAllAndReturnToHand(options, { attacker, selectedPokemonCell });

      return;
    }

    const confusionDamage = attacker.confused ? 30 : 0;
    const column = selectedPokemonCell.substring(1);
    const targetCells =
      attacker.owner === 1 ? [`C${column}`, `D${column}`] : [`B${column}`, `A${column}`];
    const targetCell = targetCells.find((cell) => board[cell] !== null);

    // --------------------------------------------
    // L'ATTAQUE ÉCHOUE SI LE POKÉMON ACTIF ADVERSE
    // POSSÈDE AU MOINS LE SEUIL DE PV MAXIMUM
    // --------------------------------------------

    const maxHpRestrictionEffect = resolvedAttack.effects?.find(
      (effect) => effect.type === 'failsIfOpponentActiveMaxHpAtLeast'
    );

    const opponentActivePokemon = targetCell
      ? board[targetCell]
      : null;

    if (
      maxHpRestrictionEffect &&
      opponentActivePokemon &&
      getPokemonMaxHp(opponentActivePokemon) >= maxHpRestrictionEffect.amount
    ) {
      setMessage(
        `${attacker.card.name} utilise ${attack.name}, mais ne fait rien : le Pokémon actif adverse possède au moins ${maxHpRestrictionEffect.amount} PV maximum.`
      );

      return;
    }

    // -----------------------------------------
// INTERDIRE LES CARTES OBJET AU PROCHAIN TOUR
// DE L'ADVERSAIRE
// -----------------------------------------

const preventOpponentItemsEffect = resolvedAttack.effects?.some(
  (effect) => effect.type === 'preventOpponentPlayingItemsNextTurn'
);

if (preventOpponentItemsEffect) {
  const opponent: Player = attacker.owner === 1 ? 2 : 1;

  if (opponent === 1) {
    setPlayer1Status((status) => ({
      ...status,
      itemsBlockedThisTurn: true,
    }));
  } else {
    setPlayer2Status((status) => ({
      ...status,
      itemsBlockedThisTurn: true,
    }));
  }
}

// Bonus si le Pokémon actif adverse dans cette colonne
// possède au moins une énergie, même si l'attaque
// vise ensuite un autre Pokémon.
const opponentActive = targetCell
  ? board[targetCell]
  : null;

totalDamage += getOpponentActiveEnergyBonusDamage(
  opponentActive,
  resolvedAttack.effects
);
    const opponentBenchCount = Object.entries(board).filter(
      ([cellName, pokemon]) =>
        pokemon !== null && pokemon.owner !== attacker.owner && cellName !== targetCell
    ).length;

    const opponentBenchBonus =
      opponentBenchCount * (attack.bonusDamagePerOpponentBenchPokemon ?? 0);

    const newBoard = { ...board };

    const discardEnergyEffect = attack.effects?.find(
      (effect) => effect.type === 'discardEnergy'
    );

    if (discardEnergyEffect) {
      const numberToDiscard = Math.min(
        discardEnergyEffect.amount,
        attacker.energies.length
      );

      const discardedEnergies = attacker.energies.slice(
        attacker.energies.length - numberToDiscard
      );

      if (attacker.owner === 1) {
        setPlayer1DiscardEnergies((discard) => [...discard, ...discardedEnergies]);
      } else {
        setPlayer2DiscardEnergies((discard) => [...discard, ...discardedEnergies]);
      }
    }

    let attackerAfterEffect = applyAttackEffects(attacker, resolvedAttack);

// -----------------------------------------
// FIXER LES DÉGÂTS DE BASE D'UNE ATTAQUE
// POUR LE PROCHAIN TOUR DU MÊME JOUEUR
// -----------------------------------------

const nextTurnAttackBaseDamageEffect = resolvedAttack.effects?.find(
  (effect) => effect.type === 'setNextTurnAttackBaseDamage'
);

if (nextTurnAttackBaseDamageEffect) {
  attackerAfterEffect = {
    ...attackerAfterEffect,

    nextTurnAttackBaseDamage:
      nextTurnAttackBaseDamageEffect.amount,

    nextTurnAttackBaseDamageAttackName:
      nextTurnAttackBaseDamageEffect.attackName ?? attack.name,

    nextTurnAttackBaseDamageTurnId: turnId + 2,
  };
}

if (
  discardAllEnergyForBonusEffect &&
  discardAllEnergyChoice === true
) {
  const discardedEnergies = [...attackerAfterEffect.energies];

  attackerAfterEffect = {
    ...attackerAfterEffect,
    energies: [],
  };

  if (attacker.owner === 1) {
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
    // --------------------------------
    // RÉDUCTION DES DÉGÂTS
    // AU PROCHAIN TOUR ADVERSE
    // --------------------------------

    const damageReductionEffect = resolvedAttack.effects?.find(
      (effect) => effect.type === 'reduceDamageNextOpponentTurn'
    );

    if (damageReductionEffect) {
      const opponent: Player = attacker.owner === 1 ? 2 : 1;

      attackerAfterEffect = {
        ...attackerAfterEffect,

        attackDamageReduction: damageReductionEffect.amount,

        attackDamageReductionEndPlayer: opponent,
      };
    }

    // --------------------------------
    // RETIRE LES ÉNERGIES UTILISÉES
    // POUR LE BONUS
    // --------------------------------

    if (discardAllForBonusEffect?.energyType && energiesDiscardedForBonus.length > 0) {
      const discardedType = discardAllForBonusEffect.energyType;

      attackerAfterEffect = {
        ...attackerAfterEffect,

        energies: attackerAfterEffect.energies.filter(
          (energy) => energy !== discardedType
        ),
      };

      if (attacker.owner === 1) {
        setPlayer1DiscardEnergies((discard) => [
          ...discard,
          ...energiesDiscardedForBonus,
        ]);
      } else {
        setPlayer2DiscardEnergies((discard) => [
          ...discard,
          ...energiesDiscardedForBonus,
        ]);
      }
    }

    const recoverEnergyEffect = resolvedAttack.effects?.find(
      (effect) => effect.type === 'recoverEnergy' && effect.energyType
    );

    if (recoverEnergyEffect && recoverEnergyEffect.energyType) {
      const discardEnergies =
        attacker.owner === 1 ? player1DiscardEnergies : player2DiscardEnergies;

      const newDiscard = [...discardEnergies];

      const recoveredEnergies: EnergyType[] = [];

      for (let i = 0; i < recoverEnergyEffect.amount; i++) {
        const energyIndex = newDiscard.findIndex(
          (energy) => energy === recoverEnergyEffect.energyType
        );

        if (energyIndex === -1) {
          break;
        }

        recoveredEnergies.push(newDiscard[energyIndex]);

        newDiscard.splice(energyIndex, 1);
      }

      if (recoveredEnergies.length > 0) {
        attackerAfterEffect = {
          ...attackerAfterEffect,

          energies: [...attackerAfterEffect.energies, ...recoveredEnergies],
        };

        if (attacker.owner === 1) {
          setPlayer1DiscardEnergies(newDiscard);
        } else {
          setPlayer2DiscardEnergies(newDiscard);
        }
      }
    }

    // -----------------------------------------
// SOIN PAR ÉNERGIE DU POKÉMON ACTIF ADVERSE
// -----------------------------------------

const healPerOpponentEnergyEffect = resolvedAttack.effects?.find(
  (effect) => effect.type === 'healSelfPerOpponentActiveEnergy'
);

// Nombre d'Énergies du Pokémon actif adverse,
// relevé avant que les effets de l'attaque ne les modifient.
const opponentEnergyCount = opponentActivePokemon?.energies.length ?? 0;

const selfHealAmount =
  (healPerOpponentEnergyEffect?.amount ?? 0) *
  opponentEnergyCount;

// La confusion inflige d'abord ses dégâts.
// Le soin ne peut pas ressusciter un Pokémon K.O.
const hpAfterConfusion =
  attackerAfterEffect.currentHp - confusionDamage;

const attackerAfterConfusion = {
  ...attackerAfterEffect,

  currentHp:
    hpAfterConfusion <= 0
      ? hpAfterConfusion
      : Math.min(
          getPokemonMaxHp(attackerAfterEffect),
          hpAfterConfusion + selfHealAmount
        ),
};

    newBoard[selectedPokemonCell] = {
      ...attackerAfterConfusion,

      hasAttacked: true,

      blockedAttackName: attack.blocksNextOwnTurn
        ? attack.name
        : attackerAfterConfusion.blockedAttackName,

      blockedAttackTurnId: attack.blocksNextOwnTurn
        ? turnId + 2
        : attackerAfterConfusion.blockedAttackTurnId,

      blockedAllAttacksTurnId: attack.blocksAllAttacksNextOwnTurn
        ? turnId + 2
        : attackerAfterConfusion.blockedAllAttacksTurnId,
    };


    // =====================================
    // SOIN DES POKÉMON SELON LEUR TYPE
    // OU DE TOUS LES POKÉMON
    // =====================================

    const healPokemonByTypeEffect = resolvedAttack.effects?.find(
      (effect) => effect.type === 'healPokemonByType'
    );

    if (healPokemonByTypeEffect) {
      for (const [cellName, pokemon] of Object.entries(newBoard)) {
        // Ignorer les cases vides et les Pokémon déjà K.O.
        if (
  !pokemon ||
  pokemon.currentHp <= 0 ||
  pokemon.owner !== attacker.owner
) {
  continue;
}

        const matchesTarget =
          healPokemonByTypeEffect.targetAllPokemon === true ||
          (
            healPokemonByTypeEffect.pokemonType !== undefined &&
            pokemon.card.type === healPokemonByTypeEffect.pokemonType
          );

        if (!matchesTarget) {
          continue;
        }

        newBoard[cellName] = {
          ...pokemon,
          currentHp: Math.min(
            getPokemonMaxHp(pokemon),
            pokemon.currentHp + healPokemonByTypeEffect.amount
          ),
        };
      }
    }

    // =====================================
    // DÉFAUSSE DES ÉNERGIES PAR TYPE
    // =====================================

    const typedDiscardEffects =
      resolvedAttack.effects?.filter(
        (effect) =>
          effect.type === 'discardTypedEnergy' &&
          effect.energyType
      ) ?? [];

    if (typedDiscardEffects.length > 0) {
      const currentAttacker =
        newBoard[selectedPokemonCell];

      if (currentAttacker) {
        const remainingEnergies = [
          ...currentAttacker.energies,
        ];

        const discardedEnergies: EnergyType[] = [];

        // Traiter chaque effet de défausse.
        for (const effect of typedDiscardEffects) {
          if (!effect.energyType) continue;

          for (let i = 0; i < effect.amount; i++) {
            const index = remainingEnergies.indexOf(
              effect.energyType
            );

            if (index === -1) continue;

            discardedEnergies.push(
              remainingEnergies[index]
            );

            remainingEnergies.splice(index, 1);
          }
        }

        // Retirer les énergies du Pokémon.
        newBoard[selectedPokemonCell] = {
          ...currentAttacker,
          energies: remainingEnergies,
        };

        // Ajouter les énergies à la bonne défausse.
        if (discardedEnergies.length > 0) {
          if (attacker.owner === 1) {
            setPlayer1DiscardEnergies(
              (previous) => [
                ...previous,
                ...discardedEnergies,
              ]
            );
          } else {
            setPlayer2DiscardEnergies(
              (previous) => [
                ...previous,
                ...discardedEnergies,
              ]
            );
          }
        }
      }
    }

    // =====================================
// DÉGÂTS AUX POKÉMON AYANT UN TALENT
// =====================================

const talentDamageEffect = resolvedAttack.effects?.find(
  (effect) => effect.type === 'damageAllPokemonWithTalent'
);

if (talentDamageEffect) {
  hitPokemonWithTalent(
    options,
    newBoard,
    talentDamageEffect.amount,
    attacker,
    attack.name
  );

  return;
}

    // =====================================
    // DÉGÂTS À TOUS, SANS PROTECTION
    // =====================================

    const globalDamageEffect = resolvedAttack.effects?.find(
      (effect) =>
        effect.type === 'damageEveryoneIgnoringEffects'
    );

    if (globalDamageEffect) {
      hitEveryoneIgnoringEffects(
        options,
        newBoard,
        globalDamageEffect.amount+
        getToolAttachedAttackBonus(attacker, attack),
        attacker.card.name,
        attack.name
      );

      return;
    }


    // --------------------------------
// DÉGÂTS À NOS PROPRES POKÉMON
// DE BANC
// --------------------------------

const ownBenchDamage = attack.ownBenchDamage ?? 0;
const optionalOwnBenchDamage = optionalBonusDamage;

if (ownBenchDamage > 0 || optionalOwnBenchDamage > 0) {
  Object.entries(newBoard).forEach(
    ([cellName, benchPokemon]) => {
      if (!benchPokemon) {
        return;
      }

      // Seulement nos Pokémon
      if (
        benchPokemon.owner !==
        attacker.owner
      ) {
        return;
      }

      // L'attaquant lui-même n'est
      // pas considéré comme son banc
      if (
        cellName ===
        selectedPokemonCell
      ) {
        return;
      }
const damageForThisPokemon =
  ownBenchDamage +
  (cellName === ownBenchDamageTargetCell ? optionalOwnBenchDamage : 0);

if (damageForThisPokemon <= 0) {
  return;
}
      
      // Talent d'Azumarill : réduction des dégâts
      // provenant des Pokémon Feu et Eau.
      const fireWaterReduction =
        benchPokemon.card.talent?.type === 'passive' &&
        benchPokemon.card.talent.effect ===
          'reduceDamageFromFireWater' &&
        (attacker.card.type === 'feu' ||
          attacker.card.type === 'eau')
          ? (benchPokemon.card.talent.amount ?? 30)
          : 0;

      const actualOwnBenchDamage = Math.max(
  0,
  damageForThisPokemon - fireWaterReduction
);

      const newBenchHp =
        benchPokemon.currentHp - actualOwnBenchDamage;


      // Le Pokémon survit
      if (newBenchHp > 0) {
        newBoard[cellName] = {
          ...benchPokemon,
          currentHp: newBenchHp,
        };

        return;
      }

      // ----------------------------
      // K.O. DU POKÉMON DE BANC
      // ----------------------------

      const penalty =
        getKOPenalty(
          benchPokemon.card.stage,
          benchPokemon.card.variant
        );

      newBoard[cellName] = null;

      prepareKOEnergyMove(
        benchPokemon,
        newBoard
      );

      if (benchPokemon.owner === 1) {
        setPlayer1Damage(
          (damage) =>
            damage + penalty
        );

        setPlayer1DiscardEnergies(
          (discard) => [
            ...discard,
            ...benchPokemon.energies,
          ]
        );

        setPlayer1Discard(
          (discard) => [
            ...discard,
            benchPokemon.card,

            ...(benchPokemon.attachedTool
              ? [
                  benchPokemon
                    .attachedTool,
                ]
              : []),
          ]
        );
      } else {
        setPlayer2Damage(
          (damage) =>
            damage + penalty
        );

        setPlayer2DiscardEnergies(
          (discard) => [
            ...discard,
            ...benchPokemon.energies,
          ]
        );

        setPlayer2Discard(
          (discard) => [
            ...discard,
            benchPokemon.card,

            ...(benchPokemon.attachedTool
              ? [
                  benchPokemon
                    .attachedTool,
                ]
              : []),
          ]
        );
      }
    }
  );
}


    // =====================================
    // TRANSFÉRER UNE ÉNERGIE DE L'ATTAQUANT
    // VERS UN POKÉMON DE BANC
    // =====================================

    const moveEnergyToBenchEffect = resolvedAttack.effects?.find(
      (effect) =>
        effect.type === 'moveOwnEnergyToBench' &&
        effect.energyType
    );

    if (
      moveEnergyToBenchEffect &&
      moveEnergyToBenchEffect.energyType
    ) {
      const energyType = moveEnergyToBenchEffect.energyType;
      const amount = moveEnergyToBenchEffect.amount;

      const currentAttacker = newBoard[selectedPokemonCell];

      const availableEnergyCount =
        currentAttacker?.energies.filter(
          (energy) => energy === energyType
        ).length ?? 0;

      const hasBenchPokemon = Object.entries(newBoard).some(
        ([cellName, pokemon]) =>
          pokemon !== null &&
          pokemon.owner === attacker.owner &&
          cellName !== selectedPokemonCell
      );

      if (hasBenchPokemon && availableEnergyCount >= amount) {
        setBoard(newBoard);

        options.setPendingGeneratedBenchEnergy({
          player: attacker.owner,
          attackerCell: selectedPokemonCell,
          energyType,
          amount,
          moveFromAttacker: true,
        });

        setSelectedPokemonCell(null);
        setSelectedAttackIndex(null);

        setMessage(
          `Choisis un Pokémon de banc pour recevoir ${amount} Énergie ${energyType} de ${attacker.card.name}.`
        );

        return;
      }

      setBoard(newBoard);
      setSelectedPokemonCell(null);
      setSelectedAttackIndex(null);

      setMessage(
        !hasBenchPokemon
          ? `${attacker.card.name} utilise ${attack.name}, mais aucun Pokémon de banc n'est disponible.`
          : `${attacker.card.name} utilise ${attack.name}, mais ne possède pas assez d'Énergies ${energyType} à transférer.`
      );

      return;
    }


    // =====================================
    // ATTACHER UNE ÉNERGIE CRÉÉE
    // À UN POKÉMON DE BANC
    // =====================================

    const attachEnergyToBenchEffect = resolvedAttack.effects?.find(
      (effect) => effect.type === 'attachEnergyToBench' && effect.energyType
    );

    if (attachEnergyToBenchEffect && attachEnergyToBenchEffect.energyType) {
      startBenchEnergyAttachment(options, {
        attachEnergyToBenchEffect,
        attack,
        attacker,
        energyType: attachEnergyToBenchEffect.energyType,
        newBoard,
        selectedPokemonCell,
      });

      return;
    }

    // --------------------------------
    // CIBLE LIBRE : N'IMPORTE QUEL
    // POKÉMON ADVERSE
    // --------------------------------

    if (
      attack.targetMode === 'anyOpponentPokemon' ||
      attack.targetMode === 'damagedOpponentOrPlayer'
    ) {
      startFreeTargetAttack(options, {
        attack: attackForDamage,
        attacker,
        attackerAfterConfusion,
        newBoard,
        resolvedAttack,
        selectedPokemonCell,
        totalDamage,
      });

      return;
    }
    const opponentPlayerStatusForPoison =
  attacker.owner === 1
    ? player2Status
    : player1Status;

    
const transferAllEnergiesEffect = resolvedAttack.effects?.find(
  (effect) => effect.type === 'transferAllEnergiesToBench'
);

const requestEnergyTransferToBench = () => {
  if (!transferAllEnergiesEffect) {
    return;
  }

  const source = newBoard[selectedPokemonCell];

  if (!source || source.energies.length === 0) {
    return;
  }

  const hasBenchPokemon = Object.entries(newBoard).some(
    ([cellName, pokemon]) =>
      pokemon !== null &&
      pokemon.owner === attacker.owner &&
      cellName !== selectedPokemonCell
  );

  if (!hasBenchPokemon) {
    return;
  }

  // Si l'effet est facultatif, demander confirmation.
  if (transferAllEnergiesEffect.optional) {
    const message =
      "Voulez-vous déplacer toutes les Énergies de ce Pokémon vers l'un de vos Pokémon de Banc ?";

    setPendingOptionalAttackEffect({
      pokemonName: attacker.card.name,
      message,
      effectType: 'transferAllEnergiesToBench',
      player: attacker.owner,
      attackerCell: selectedPokemonCell,
    });

    setMessage(message);
    return;
  }

  // Sinon, conserver le comportement actuel.
  setPendingEnergyTransferToBench({
    player: attacker.owner,
    attackerCell: selectedPokemonCell,
  });

  setMessage(
    `${attacker.card.name} utilise ${attack.name}. Choisis un de tes Pokémon de Banc pour lui transférer toutes ses Énergies.`
  );
};


// -----------------------------------------
// INVOQUER UN POKÉMON SUR LA RANGÉE DE JEU
// (ex : Division de Tadmorv d'Alola)
// -----------------------------------------

const summonEffect = resolvedAttack.effects?.find(
  (effect) => effect.type === 'summonPokemon'
);

const requestAttackSummon = () => {
  if (!summonEffect) {
    return;
  }

  // Carte à invoquer : celle indiquée par l'effet,
  // sinon une copie du Pokémon attaquant.
  const summonCard = summonEffect.summonCardId
    ? ALL_POKEMON_CARDS.find((card) => card.id === summonEffect.summonCardId)
    : attacker.card;

  if (!summonCard) {
    setMessage(`${attack.name} : la carte à invoquer est introuvable.`);
    return;
  }

  const summonRow = attacker.owner === 1 ? 'B' : 'C';

  const hasFreeCell = [1, 2, 3, 4].some(
    (column) => newBoard[`${summonRow}${column}`] === null
  );

  if (!hasFreeCell) {
    setMessage(
      `${attacker.card.name} utilise ${attack.name}, mais aucune case n'est libre de ${summonRow}1 à ${summonRow}4 : aucune Invocation.`
    );
    return;
  }

  setPendingAttackSummonPlacement({
    player: attacker.owner,
    card: summonCard,
    remaining: Math.max(1, summonEffect.amount),
    attackerName: attacker.card.name,
    attackName: attack.name,
  });

  setMessage(
    `${attacker.card.name} utilise ${attack.name}. Choisis une case libre de ${summonRow}1 à ${summonRow}4 pour invoquer ${summonCard.name}.`
  );
};

    // UN POKÉMON EST TOUCHÉ
    if (targetCell) {
      hitOpponentPokemon(options, {
        attack: attackForDamage,
        attacker,
        attackerAfterConfusion,
        newBoard,
        opponentBenchBonus,
        opponentPlayerPoisoned:
        opponentPlayerStatusForPoison.poisoned,
        resolvedAttack,
        selectedPokemonCell,
        targetCell,
        totalDamage,
      });

requestEnergyTransferToBench();
requestAttackSummon();

      return;
    }

    // --------------------------------
    // AUCUN POKÉMON : ATTAQUE DIRECTE
    // --------------------------------

    // Comme aucun Pokémon n'est devant
    // l'attaquant, tous les Pokémon adverses
    // présents sur le plateau sont considérés
    // comme des Pokémon de banc.
    const directOpponentBenchCount = Object.values(board).filter(
      (pokemon) => pokemon !== null && pokemon.owner !== attacker.owner
    ).length;

    const directOpponentBenchBonus =
      directOpponentBenchCount * (attack.bonusDamagePerOpponentBenchPokemon ?? 0);

    const opponent: Player = attacker.owner === 1 ? 2 : 1;

    
    const opponentStatus =
      opponent === 1
        ? player1Status
        : player2Status;

    const PlayerExtraDamage =
      opponentStatus.extraDamageNextTurnReady &&
      opponentStatus.extraDamageNextTurnSourcePlayer === attacker.owner
        ? (opponentStatus.extraDamageNextTurn ?? 0)
        : 0;
const bonusDamageIfPoisonedEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type === 'bonusDamageIfTargetPoisoned'
  );

const poisonedPlayerBonus =
  attack.fixedDamage === undefined &&
  opponentStatus.poisoned
    ? (bonusDamageIfPoisonedEffect?.amount ?? 0)
    : 0;

const specialConditionDamageEffect =
  resolvedAttack.effects?.find(
    (effect) =>
      effect.type ===
      'bonusDamagePerOpponentActiveSpecialCondition'
  );

const opponentPlayerSpecialConditionCount = [
  opponentStatus.poisoned,
  opponentStatus.burned,
].filter(Boolean).length;

const directSpecialConditionBonus =
  specialConditionDamageEffect
    ? opponentPlayerSpecialConditionCount *
      specialConditionDamageEffect.amount
    : 0;

    // -----------------------------------------
// TRANSFÉRER TOUTES LES ÉNERGIES AU BANC
// -----------------------------------------



    const directDamage =
  (attack.fixedDamage !== undefined
    ? attack.fixedDamage +
      getToolAttachedAttackBonus(attacker, attack)
    : totalDamage + directOpponentBenchBonus) +
  PlayerExtraDamage+
   directSpecialConditionBonus+
  poisonedPlayerBonus;


    // --------------------------------
    // VOL DE VIE SUR LE JOUEUR ADVERSE
    // --------------------------------

    const hasDirectDrainEffect =
      resolvedAttack.effects?.some(
        (effect: AttackEffect) => effect.type === 'healSelfByDamageDealt'
      ) ?? false;

    if (hasDirectDrainEffect && directDamage > 0) {
      const currentAttacker = newBoard[selectedPokemonCell];

      if (currentAttacker) {
        const attackerMaxHp = getPokemonMaxHp(currentAttacker);

        newBoard[selectedPokemonCell] = {
          ...currentAttacker,

          currentHp: Math.min(
            attackerMaxHp,

            currentAttacker.currentHp + directDamage
          ),
        };
      }
    }

    if (attacker.owner === 1) {
      setPlayer2Damage((damage) => damage + directDamage);
    } else {
      setPlayer1Damage((damage) => damage + directDamage);
    }

    if (startBenchOrPlayerDamageTarget(attacker, selectedPokemonCell, attack, null)) {
      setMessage(
  `${attacker.card.name} inflige ${directDamage} dégâts au joueur ${opponent}. Choisis maintenant un Pokémon adverse pour les ${attack.secondaryBenchOrPlayerDamage ?? 0} dégâts supplémentaires.`
);

      return;
    }

    applyAttackStatusToPlayer(opponent, attack, attacker.owner);

    const attackerAfterDirectDrain = newBoard[selectedPokemonCell] ?? attackerAfterEffect;

    handleAttackerKO(newBoard, attackerAfterDirectDrain, selectedPokemonCell);

    setBoard(newBoard);
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    setMessage(
      `${attacker.card.name} attaque directement le joueur ${opponent} avec ${attack.name} : +${directDamage} dégâts !`
    );
    requestEnergyTransferToBench();
    requestAttackSummon();
  }

function resolveOptionalAttackEffectChoice(accepted: boolean) {
  const pending = pendingOptionalAttackEffect;

  if (!pending) {
    return;
  }

  setPendingOptionalAttackEffect(null);

  if (!accepted) {
    setMessage(
      `Tu as choisi de ne pas activer l'effet de ${pending.pokemonName}.`
    );
    return;
  }

  if (pending.effectType === 'transferAllEnergiesToBench') {
    setPendingEnergyTransferToBench({
      player: pending.player,
      attackerCell: pending.attackerCell,
    });

    setMessage(
      `Choisis un de tes Pokémon de Banc pour recevoir toutes les Énergies de ${pending.pokemonName}.`
    );
    return;
  }

  setMessage("Cet effet optionnel n'est pas encore pris en charge.");
}

function resolveOptionalBonusDamageChoice(useBonus: boolean) {
  const pending = pendingOptionalBonusDamageChoice;

  if (!pending) return;

  if (useBonus) {
    setPendingOptionalBonusDamageChoice({
      ...pending,
      stage: 'target',
    });

    setMessage(
      `Choisis un de tes Pokémon de banc qui subira ${pending.benchDamage} dégâts.`
    );

    return;
  }

  setPendingOptionalBonusDamageChoice(null);

  attackSelectedPokemon(
    pending.coinResult,
    pending.discardAllEnergyChoice,
    false
  );
}

function resolveOptionalOwnBenchDamageTarget(cellName: string) {
  const pending = pendingOptionalBonusDamageChoice;

  if (!pending) return;

  const target = board[cellName];

  if (
    !target ||
    target.owner !== pending.owner ||
    cellName === pending.attackerCell
  ) {
    setMessage('Choisis un de tes Pokémon de banc.');
    return;
  }

  setPendingOptionalBonusDamageChoice(null);

  attackSelectedPokemon(
    pending.coinResult,
    pending.discardAllEnergyChoice,
    true,
    cellName
  );
}

    function resolveDiscardAllEnergyChoice(discard: boolean) {
    const pending = pendingDiscardAllEnergyChoice;

    if (!pending) return;

    setPendingDiscardAllEnergyChoice(null);
    attackSelectedPokemon(
  pending.coinResult,
  discard,
  pending.optionalBonusDamageChoice,
  pending.ownBenchDamageTargetCell
);
  }

  return {
    attackSelectedPokemon,
    pendingDiscardAllEnergyChoice,
    resolveDiscardAllEnergyChoice,
    pendingOptionalBonusDamageChoice,
    resolveOptionalBonusDamageChoice,
    resolveOptionalOwnBenchDamageTarget,
    pendingOptionalAttackEffect,
    resolveOptionalAttackEffectChoice,
  };
}
