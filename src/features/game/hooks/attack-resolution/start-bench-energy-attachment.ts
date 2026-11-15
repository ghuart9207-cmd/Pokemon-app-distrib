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
  // Appelé APRÈS les dégâts de l'attaque : on ne touche plus au plateau,
  // on demande seulement au joueur de choisir le Pokémon qui reçoit l'Énergie.
  const { board, setMessage, setPendingGeneratedBenchEnergy } = context;
  const {
    attachEnergyToBenchEffect,
    attack,
    attacker,
    energyType,
    newBoard,
    selectedPokemonCell,
  } = locals;
  const targetPokemonType = attachEnergyToBenchEffect.targetPokemonType;
  const hasBenchPokemon = Object.entries(board).some(
    ([cellName, pokemon]) =>
      pokemon !== null &&
      pokemon.owner === attacker.owner &&
      cellName !== selectedPokemonCell &&
      (!targetPokemonType || pokemon.card.type === targetPokemonType)
  );

  if (hasBenchPokemon) {
    setPendingGeneratedBenchEnergy({
      player: attacker.owner,

      attackerCell: selectedPokemonCell,

      energyType: energyType,

      amount: attachEnergyToBenchEffect.amount,

      targetPokemonType,

      // Une par FACE : à répartir entre ses Pokémon de banc, un clic par Énergie.
      oneByOne: attachEnergyToBenchEffect.perCoinFace === true,
    });

    setMessage(
      attachEnergyToBenchEffect.perCoinFace
        ? `${attachEnergyToBenchEffect.amount} Énergie(s) ${energyType} à attacher : clique sur tes Pokémon de banc${targetPokemonType ? ` de type ${targetPokemonType}` : ''}, une Énergie par clic.`
        : `Choisis l’un de tes Pokémon de banc${targetPokemonType ? ` de type ${targetPokemonType}` : ''} pour lui attacher une Énergie ${energyType}.`
    );

    return;
  }

  setMessage(
    `${attacker.card.name} utilise ${attack.name}, mais aucun Pokémon de banc ne peut recevoir l'Énergie.`
  );
}
