import {
  applyAttackEffects,
  calculateCoinDamage,
  canPayAttackCost,
  canPayTypedDiscard,
  doesAttackFailFromCoin,
  getCoinTriggeredEffects,
  getKOPenalty,
  getPokemonMaxHp,
} from '@/features/game/rules';
import type {
  Attack,
  AttackEffect,
  CoinSide,
  EnergyType,
  Player,
} from '@/features/game/types';
import { formatAttackCost } from '@/features/game/utils/card-labels';
import type { AttackResolutionContext } from './attack-resolution/attack-resolution-context';
import { healAllAndReturnToHand } from './attack-resolution/heal-all-and-return-to-hand';
import { hitOpponentPokemon } from './attack-resolution/hit-opponent-pokemon';
import { hitEveryoneIgnoringEffects } from './attack-resolution/hit-everyone-ignoring-effects';
import { resolveFailedAttack } from './attack-resolution/resolve-failed-attack';
import { startBenchEnergyAttachment } from './attack-resolution/start-bench-energy-attachment';
import { startFreeTargetAttack } from './attack-resolution/start-free-target-attack';

export function useGameAttackResolution(options: AttackResolutionContext) {
  const {
    advanceAttackOrder,
    applyAttackStatusToPlayer,
    board,
    
    player1Status,
    player2Status,

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

  function attackSelectedPokemon(coinResult?: CoinSide[]) {
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

    const attack = attacker.card.attacks[selectedAttackIndex];

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

    let totalDamage =
  calculateCoinDamage(
    attack,
    coinResult
  ) +
  switchedRecentlyBonus +
  everyTwoRoundsBonus +
  discardCardBonus;

    if (discardAllForBonusEffect) {
      totalDamage += energiesDiscardedForBonus.length * discardAllForBonusEffect.amount;
    }

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

    const attackerAfterConfusion = {
      ...attackerAfterEffect,

      currentHp: attackerAfterEffect.currentHp - confusionDamage,
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
        globalDamageEffect.amount,
        attacker.card.name,
        attack.name
      );

      return;
    }


    // --------------------------------
// DÉGÂTS À NOS PROPRES POKÉMON
// DE BANC
// --------------------------------

const ownBenchDamage =
  attack.ownBenchDamage ?? 0;

if (ownBenchDamage > 0) {
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
        ownBenchDamage - fireWaterReduction
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
        attack,
        attacker,
        attackerAfterConfusion,
        newBoard,
        resolvedAttack,
        selectedPokemonCell,
        totalDamage,
      });

      return;
    }
    // UN POKÉMON EST TOUCHÉ
    if (targetCell) {
      hitOpponentPokemon(options, {
        attack,
        attacker,
        attackerAfterConfusion,
        newBoard,
        opponentBenchBonus,
        resolvedAttack,
        selectedPokemonCell,
        targetCell,
        totalDamage,
      });

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

    const directDamage =
      (attack.fixedDamage !== undefined
        ? attack.fixedDamage
        : totalDamage + directOpponentBenchBonus) +
      PlayerExtraDamage;


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
        `${attacker.card.name} inflige ${directDamage} dégâts au joueur ${opponent}. Choisis maintenant un Pokémon de banc adverse ou le joueur adverse pour les 30 dégâts supplémentaires.`
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
  }

  return { attackSelectedPokemon };
}
