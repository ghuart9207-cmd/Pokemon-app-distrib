import type {
  Attack,
  PendingOpponentTarget,
  Player,
  PlayerStatusState,
  PokemonInPlay,
  SetState,
} from '@/features/game/types';

type UseGameTargetingOptions = {
  pendingOpponentTarget: PendingOpponentTarget | null;
  setPendingOpponentTarget: SetState<PendingOpponentTarget | null>;
  player1Damage: number;
  player2Damage: number;
  setPlayer1Damage: SetState<number>;
  setPlayer2Damage: SetState<number>;
  player1Status: PlayerStatusState;
  player2Status: PlayerStatusState;
  setMessage: SetState<string>;
  setSelectedPokemonCell: SetState<string | null>;
  setSelectedAttackIndex: SetState<number | null>;
};

export function useGameTargeting({
  pendingOpponentTarget,
  setPendingOpponentTarget,
  player1Damage,
  player2Damage,
  setPlayer1Damage,
  setPlayer2Damage,
  player1Status,
  player2Status,
  setMessage,
  setSelectedPokemonCell,
  setSelectedAttackIndex,
}: UseGameTargetingOptions) {
  function handlePlayerTargetPress(targetPlayer: Player) {
    if (!pendingOpponentTarget) {
      return;
    }

    if (targetPlayer === pendingOpponentTarget.player) {
      setMessage('Tu dois choisir le joueur adverse.');
      return;
    }

    const currentDamage = targetPlayer === 1 ? player1Damage : player2Damage;
    if (pendingOpponentTarget.mode === 'damagedOpponentOrPlayer' && currentDamage <= 0) {
      setMessage(`Le joueur ${targetPlayer} n'a aucun marqueur de dégâts.`);
      return;
    }

    const targetStatus = targetPlayer === 1 ? player1Status : player2Status;
    const extraDamage =
      targetStatus.extraDamageNextTurnReady &&
      targetStatus.extraDamageNextTurnSourcePlayer === pendingOpponentTarget.player
        ? (targetStatus.extraDamageNextTurn ?? 0)
        : 0;
    const finalDamage = pendingOpponentTarget.damage + extraDamage;

    if (targetPlayer === 1) {
      setPlayer1Damage((damage) => damage + finalDamage);
    } else {
      setPlayer2Damage((damage) => damage + finalDamage);
    }

    setMessage(`Le joueur ${targetPlayer} subit ${finalDamage} dégâts.`);
    setPendingOpponentTarget(null);
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
  }

  function canSelectPlayerTarget(player: Player): boolean {
    if (!pendingOpponentTarget || player === pendingOpponentTarget.player) {
      return false;
    }

    if (pendingOpponentTarget.mode === 'damagedOpponentOrPlayer') {
      return (player === 1 ? player1Damage : player2Damage) > 0;
    }

    return true;
  }

  function startBenchOrPlayerDamageTarget(
    attacker: PokemonInPlay,
    attackerCell: string,
    attack: Attack,
    mainTargetCell: string | null
  ): boolean {
    const secondaryDamage = attack.secondaryBenchOrPlayerDamage ?? 0;
    if (secondaryDamage <= 0) {
      return false;
    }

    setPendingOpponentTarget({
      player: attacker.owner,
      attackerCell,
      damage: secondaryDamage,
      mode: 'benchOrPlayer',
      excludedCell: mainTargetCell,
    });

    return true;
  }

  return {
    canSelectPlayerTarget,
    handlePlayerTargetPress,
    startBenchOrPlayerDamageTarget,
  };
}
