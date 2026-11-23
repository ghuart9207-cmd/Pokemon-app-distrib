import {
  doesToolAttackerShieldPreventDamage,
  getKOPenalty,
  hasScriptImmunity,
  isTalentNegated,
} from '@/features/game/rules';
import type {
  Attack,
  BoardState,
  EnergyType,
  GameCard,
  PendingKOEnergyMove,
  PendingKOSurvival,
  Player,
  PlayerStatusState,
  PokemonInPlay,
  SetState,
} from '@/features/game/types';

type UseGameCombatSupportOptions = {
  board: BoardState;
  setMessage: SetState<string>;
  setBoard: SetState<BoardState>;
  setPendingKOEnergyMove: SetState<PendingKOEnergyMove | null>;
  setPendingKOSurvival: SetState<PendingKOSurvival | null>;
  setPlayer1Damage: SetState<number>;
  setPlayer2Damage: SetState<number>;
  setPlayer1Discard: SetState<GameCard[]>;
  setPlayer2Discard: SetState<GameCard[]>;
  setPlayer1DiscardEnergies: SetState<EnergyType[]>;
  setPlayer2DiscardEnergies: SetState<EnergyType[]>;
  setPlayer1Status: SetState<PlayerStatusState>;
  setPlayer2Status: SetState<PlayerStatusState>;
  startPokemonCoinFlip: (cellName: string, coinCount: number) => void;
};

// Nombre d'Énergies déplacées par Relais Optimiste quand son Pokémon est K.O.
const KO_ENERGY_MOVE_AMOUNT = 2;

export function useGameCombatSupport({
  board,
  setMessage,
  setBoard,
  setPendingKOEnergyMove,
  setPendingKOSurvival,
  setPlayer1Damage,
  setPlayer2Damage,
  setPlayer1Discard,
  setPlayer2Discard,
  setPlayer1DiscardEnergies,
  setPlayer2DiscardEnergies,
  setPlayer1Status,
  setPlayer2Status,
  startPokemonCoinFlip,
}: UseGameCombatSupportOptions) {
  function prepareKOEnergyMove(
    pokemon: PokemonInPlay,
    boardAfterKO: BoardState
  ): boolean {
    if (
      pokemon.attachedTool?.effect !== 'moveEnergyOnKO' ||
      pokemon.energies.length === 0
    ) {
      return false;
    }

    const hasAnotherPokemon = Object.values(boardAfterKO).some(
      (otherPokemon) => otherPokemon !== null && otherPokemon.owner === pokemon.owner
    );

    if (!hasAnotherPokemon) {
      return false;
    }

    // Relais Optimiste : jusqu'à 2 Énergies déplacées
    // (moins si le Pokémon K.O. en avait moins).
    const energiesToMove = Math.min(
      KO_ENERGY_MOVE_AMOUNT,
      pokemon.energies.length
    );

    setPendingKOEnergyMove({
      player: pokemon.owner,
      sourcePokemonName: pokemon.card.name,
      availableEnergies: [...pokemon.energies],
      selectedEnergy: null,
      remaining: energiesToMove,
      total: energiesToMove,
      targetCell: null,
    });
    return true;
  }

  function getPokemonLockKey(player: Player, cardId: string): string {
    return `${player}-${cardId}`;
  }

  function handleAttackerKO(
    newBoard: BoardState,
    attacker: PokemonInPlay,
    attackerCell: string
  ): boolean {
    if (attacker.currentHp > 0) {
      return false;
    }

    if (
      attacker.card.talent?.effect === 'surviveKOOnCoin' &&
      !isTalentNegated(attacker, newBoard, attackerCell)
    ) {
      newBoard[attackerCell] = { ...attacker, currentHp: 0 };
      setPendingKOSurvival({ cellName: attackerCell, player: attacker.owner });
      startPokemonCoinFlip(attackerCell, 1);
      setMessage(
        `${attacker.card.name} devrait être mis K.O. ! Lance une pièce pour tenter de rester en jeu avec 10 PV.`
      );
      return false;
    }

    const penalty = getKOPenalty(attacker.card.stage, attacker.card.variant);
    newBoard[attackerCell] = null;
    prepareKOEnergyMove(attacker, newBoard);

    const discardedCards = [
      attacker.card,
      ...(attacker.attachedTool ? [attacker.attachedTool] : []),
    ];

    if (attacker.owner === 1) {
      setPlayer1Damage((damage) => damage + penalty);
      setPlayer1Discard((discard) => [...discard, ...discardedCards]);
      setPlayer1DiscardEnergies((discard) => [...discard, ...attacker.energies]);
    } else {
      setPlayer2Damage((damage) => damage + penalty);
      setPlayer2Discard((discard) => [...discard, ...discardedCards]);
      setPlayer2DiscardEnergies((discard) => [...discard, ...attacker.energies]);
    }

    return true;
  }

  function applyAttackStatusToPlayer(
    player: Player,
    attack: Attack,
    sourcePlayer: Player
  ) {
    const poisonEffect = attack.effects?.find((effect) => effect.type === 'poison');
    const burnEffect = attack.effects?.find((effect) => effect.type === 'burn');
    const extraDamageEffect = attack.effects?.find(
      (effect) => effect.type === 'takeExtraDamageNextTurn'
    );

    function updateStatus(previousStatus: PlayerStatusState): PlayerStatusState {
      let nextStatus = { ...previousStatus };
      if (poisonEffect) {
        nextStatus = {
          ...nextStatus,
          poisoned: true,
          poisonSourcePlayer: sourcePlayer,
        };
      }
      if (burnEffect) {
        nextStatus = {
          ...nextStatus,
          burned: true,
          burnSourcePlayer: sourcePlayer,
          burnTriggersRemaining: 2,
        };
      }
      if (extraDamageEffect) {
        nextStatus = {
          ...nextStatus,
          extraDamageNextTurn: extraDamageEffect.amount,
          extraDamageNextTurnSourcePlayer: sourcePlayer,
          extraDamageNextTurnReady: false,
        };
      }
      return nextStatus;
    }

    if (player === 1) {
      setPlayer1Status(updateStatus);
    } else {
      setPlayer2Status(updateStatus);
    }
  }

  function startKOSurvivalTalent(
    pokemon: PokemonInPlay,
    cellName: string,
    newBoard: BoardState
  ): boolean {
    if (
      pokemon.card.talent?.effect !== 'surviveKOOnCoin' ||
      isTalentNegated(pokemon, newBoard, cellName)
    ) {
      return false;
    }

    newBoard[cellName] = { ...pokemon, currentHp: 0 };
    setBoard(newBoard);
    setPendingKOSurvival({ cellName, player: pokemon.owner });
    startPokemonCoinFlip(cellName, 1);
    setMessage(
      `${pokemon.card.name} devrait être mis K.O. ! Lance une pièce pour son Talent ${pokemon.card.talent.name}.`
    );
    return true;
  }

  function doesTalentPreventAllAttackEffects(
    target: PokemonInPlay,
    attacker: PokemonInPlay
  ): boolean {
    return (
      doesTalentPreventEverything(target, attacker) ||
      // Code des cartes : immunité aux effets des attaques.
      hasScriptImmunity(target, 'effects', attacker, board)
    );
  }

  function doesTalentPreventEverything(
    target: PokemonInPlay,
    attacker: PokemonInPlay
  ): boolean {
    return (
      target.card.talent?.effect === 'preventAllEffectsFromExGx' &&
      !isTalentNegated(target, board) &&
      attacker.owner !== target.owner &&
      (attacker.card.variant === 'gx' || attacker.card.variant === 'ex')
    );
  }

  function doesTalentPreventDamage(
    target: PokemonInPlay,
    attacker: PokemonInPlay
  ): boolean {
    if (doesTalentPreventEverything(target, attacker)) {
      return true;
    }

    // Code des cartes : immunité aux dégâts des attaques.
    if (hasScriptImmunity(target, 'damage', attacker, board)) {
      return true;
    }

    // Talent d'un allié : les Pokémon Métal évitent les dégâts des attaquants avec un Outil.
    if (doesToolAttackerShieldPreventDamage(target, attacker, board)) {
      return true;
    }

    const talent = target.card.talent;
    return !!(
      talent &&
      !isTalentNegated(target, board) &&
      talent.type === 'passive' &&
      talent.effect === 'preventDamageFromType' &&
      talent.blockedType === attacker.card.type
    );
  }

  return {
    applyAttackStatusToPlayer,
    doesTalentPreventAllAttackEffects,
    doesTalentPreventDamage,
    getPokemonLockKey,
    handleAttackerKO,
    prepareKOEnergyMove,
    startKOSurvivalTalent,
  };
}
