import type {
  Attack,
  AttackEffect,
  EnergyType,
  PokemonInPlay,
} from '@/features/game/types';
import type { AttackResolutionContext } from './attack-resolution-context';

/** Attaque qui attache une Énergie à un Pokémon de banc : le joueur choisit lequel, s'il en a un. */
export function startBenchEnergyAttachment(
  context: AttackResolutionContext,
  locals: {
    attachEnergyToBenchEffect: AttackEffect;
    attack: Attack;
    attacker: PokemonInPlay;
    energyType: EnergyType;
    newBoard: { [x: string]: PokemonInPlay | null };
    selectedPokemonCell: string;
  }
): void {
  const {
    board,
    setBoard,
    setMessage,
    setPendingGeneratedBenchEnergy,
    setSelectedAttackIndex,
    setSelectedPokemonCell,
  } = context;
  const {
    attachEnergyToBenchEffect,
    attack,
    attacker,
    energyType,
    newBoard,
    selectedPokemonCell,
  } = locals;
  const hasBenchPokemon = Object.entries(board).some(
    ([cellName, pokemon]) =>
      pokemon !== null &&
      pokemon.owner === attacker.owner &&
      cellName !== selectedPokemonCell
  );

  if (hasBenchPokemon) {
    setBoard(newBoard);

    setPendingGeneratedBenchEnergy({
      player: attacker.owner,

      attackerCell: selectedPokemonCell,

      energyType: energyType,

      amount: attachEnergyToBenchEffect.amount,
    });

    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);

    setMessage(
      `Choisis l’un de tes Pokémon de banc pour lui attacher une Énergie ${energyType}.`
    );

    return;
  }

  setBoard(newBoard);

  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    `${attacker.card.name} utilise ${attack.name}, mais aucun Pokémon de banc ne peut recevoir l'Énergie.`
  );
}
