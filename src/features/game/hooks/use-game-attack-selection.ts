import {
  getAttackCoinCount,
  getPendingAttackCoinCheck,
  getPokemonMaxHp,
  hasFailedAttackCoinCheck,
  isScriptAttackPrevented,
  isScriptPrevented,
  isTalentNegated,
} from '@/features/game/rules';
import { getAvailablePokemonAttacks } from '@/features/game/utils/available-pokemon-attacks';
import type {
  BoardState,
  CoinAttackReference,
  CoinSide,
  Player,
  PokemonInPlay,
  SetState,
  GameCard,
} from '@/features/game/types';

type UseGameAttackSelectionOptions = {
  board: BoardState;
  selectedPokemonCell: string | null;
  selectedAttackIndex: number | null;
  readyCoinAttack: CoinAttackReference | null;
  turnId: number;
  player1Discard: GameCard[];
  player2Discard: GameCard[];
  player1Damage: number;
  player2Damage: number;
  canAttackInCurrentOrder: (cellName: string) => boolean;
  getBaseAttackBlocker: (cellName: string) => PokemonInPlay | null;
  setMessage: SetState<string>;
  setPendingAttackAfterCoin: SetState<CoinAttackReference | null>;
  setReadyCoinAttack: SetState<CoinAttackReference | null>;
  startPokemonCoinFlip: (cellName: string, coinCount: number) => void;
  attackSelectedPokemon: (coinResult?: CoinSide[]) => void;
};

export function useGameAttackSelection({
  board,
  selectedPokemonCell,
  selectedAttackIndex,
  readyCoinAttack,
  turnId,
  player1Damage,
  player2Damage,
  player1Discard,
  player2Discard,
  canAttackInCurrentOrder,
  getBaseAttackBlocker,
  setMessage,
  setPendingAttackAfterCoin,
  setReadyCoinAttack,
  startPokemonCoinFlip,
  attackSelectedPokemon,
}: UseGameAttackSelectionOptions) {
  function tryAttackSelectedPokemon() {
    if (!selectedPokemonCell) {
      return;
    }

    if (!canAttackInCurrentOrder(selectedPokemonCell)) {
      setMessage(
        `${selectedPokemonCell} ne peut plus attaquer dans l'ordre choisi ce tour.`
      );
      return;
    }

    if (selectedAttackIndex === null) {
      setMessage('Choisis d’abord une attaque.');
      return;
    }

    const pokemon = board[selectedPokemonCell];
    if (!pokemon) {
      return;
    }

    


    
if (isScriptPrevented(pokemon, 'attack')) {
  setMessage(`${pokemon.card.name} ne peut pas attaquer pour le moment (effet en cours).`);
  return;
}

if (pokemon.blockedAllAttacksTurnId === turnId) {
  setMessage(
    `${pokemon.card.name} ne peut pas attaquer pendant ce tour à cause de son attaque précédente.`
  );
  return;
}


    const baseAttackBlocker = getBaseAttackBlocker(selectedPokemonCell);
    if (baseAttackBlocker) {
      setMessage(
        `${pokemon.card.name} est un Pokémon de Base et ne peut pas attaquer à cause du Talent ${baseAttackBlocker.card.talent?.name} de ${baseAttackBlocker.card.name}.`
      );
      return;
    }

    if (pokemon.asleep) {
      setMessage(`${pokemon.card.name} est endormi et ne peut pas attaquer.`);
      return;
    }

    const discardForAttackList =
  pokemon.owner === 1 ? player1Discard : player2Discard;

const attack = getAvailablePokemonAttacks(
  pokemon,
  discardForAttackList,
  isTalentNegated(pokemon, board)
)[selectedAttackIndex]?.attack;
    if (attack?.targetMode === 'damagedOpponentOrPlayer') {
      const opponent: Player = pokemon.owner === 1 ? 2 : 1;
      const hasDamagedOpponentPokemon = Object.values(board).some(
        (target) =>
          target !== null &&
          target.owner === opponent &&
          target.currentHp < getPokemonMaxHp(target)
      );
      const opponentDamage = opponent === 1 ? player1Damage : player2Damage;

      if (!hasDamagedOpponentPokemon && opponentDamage <= 0) {
        setMessage('Aucune cible adverse n’a de marqueur de dégâts.');
        return;
      }
    }

    if (!attack) {
      return;
    }

    // Code des cartes : attaque interdite (blockAttack, ou prevent avec attackName).
    if (isScriptAttackPrevented(pokemon, attack.name)) {
      setMessage(`${pokemon.card.name} ne peut pas utiliser ${attack.name} pour le moment (effet en cours).`);
      return;
    }

    if (
      pokemon.blockedAttackName === attack.name &&
      pokemon.blockedAttackTurnId === turnId
    ) {
      setMessage(
        `${pokemon.card.name} ne peut pas utiliser ${attack.name} pendant ce tour.`
      );
      return;
    }

    // -----------------------------------------
    // LANCER DE PIÈCES IMPOSÉ PAR L'ADVERSAIRE AVANT D'ATTAQUER
    // (ses propres pièces : son compteur personnel s'applique)
    // -----------------------------------------
    const coinCheck = getPendingAttackCoinCheck(pokemon, turnId);

    if (coinCheck) {
      setReadyCoinAttack(null);
      setPendingAttackAfterCoin({
        cellName: selectedPokemonCell,
        attackIndex: selectedAttackIndex,
        isCoinCheck: true,
      });
      startPokemonCoinFlip(selectedPokemonCell, coinCheck.coinCount);
      setMessage(
        `${pokemon.card.name} doit lancer ${coinCheck.coinCount} pièces avant d'attaquer : au moins un ${coinCheck.failsOn === 'pile' ? 'PILE' : 'FACE'} et son attaque ne fait rien.`
      );
      return;
    }

    // Lancer de vérification raté : l'attaque ne fait rien (sans lancer ses pièces).
    if (hasFailedAttackCoinCheck(pokemon, turnId)) {
      setReadyCoinAttack(null);
      setPendingAttackAfterCoin(null);
      attackSelectedPokemon();
      return;
    }

    if (
      readyCoinAttack &&
      readyCoinAttack.cellName === selectedPokemonCell &&
      readyCoinAttack.attackIndex === selectedAttackIndex
    ) {
      const coinResult = readyCoinAttack.coinResult;
      setReadyCoinAttack(null);
      attackSelectedPokemon(coinResult);
      return;
    }

    // Nombre de pièces : fixe, ou une par Énergie d'un type attachée.
    const coinCount = getAttackCoinCount(attack, pokemon);

    if (coinCount > 0) {
      setPendingAttackAfterCoin({
        cellName: selectedPokemonCell,
        attackIndex: selectedAttackIndex,
      });
      startPokemonCoinFlip(selectedPokemonCell, coinCount);
      return;
    }

    setPendingAttackAfterCoin(null);
    attackSelectedPokemon();
  }

  return { tryAttackSelectedPokemon };
}
