import {
  canAttachEnergyFromSource,
  getPokemonMaxHp,
  isActivePokemonCell,
  isHealBlocked,
} from '@/features/game/rules';
import type {
  BoardState,
  Player,
  PokemonInPlay,
  TrainerCard,
} from '@/features/game/types';

/**
 * Effets de Dresseur « à réglages » : on choisit l'effet, puis on ajoute
 * des contraintes avec `target` (type, nom, Énergies, stade, position…)
 * et, si on veut, un lancer de pièce avec `coinCount` (FACE = l'effet s'applique).
 */
export function isGenericTrainerEffect(card: TrainerCard | null | undefined): boolean {
  return card?.effect === 'healPokemon' || card?.effect === 'attachEnergy';
}

/** Texte qui décrit la contrainte (pour les messages). */
export function describeTrainerTarget(card: TrainerCard): string {
  const target = card.target;
  if (!target) return 'un de tes Pokémon';

  const parts: string[] = [];
  if (target.pokemonTypes?.length) parts.push(`de type ${target.pokemonTypes.join(' ou ')}`);
  if (target.pokemonNames?.length) parts.push(`nommé ${target.pokemonNames.join(' ou ')}`);
  if (target.stages?.length) parts.push(`de stade ${target.stages.join(' ou ')}`);
  if (target.variants?.length) parts.push(`${target.variants.join(' ou ')}`);
  if (target.hasEnergyType) parts.push(`avec une Énergie ${target.hasEnergyType}`);
  else if (target.hasEnergy) parts.push('avec au moins une Énergie');
  if (target.position === 'active') parts.push('actif');
  if (target.position === 'bench') parts.push('de banc');

  return parts.length > 0 ? `un de tes Pokémon ${parts.join(', ')}` : 'un de tes Pokémon';
}

/** Pourquoi ce Pokémon ne peut pas être choisi (null = il peut l'être). */
export function getTrainerTargetError(
  card: TrainerCard,
  board: BoardState,
  cellName: string,
  player: Player
): string | null {
  const pokemon = board[cellName];

  if (!pokemon) return `Choisis ${describeTrainerTarget(card)}.`;
  if (pokemon.owner !== player) return 'Tu dois choisir un de tes propres Pokémon.';
  if (pokemon.isInvocation) {
    return `${pokemon.card.name} est une Invocation et ne peut pas être ciblé par une carte Dresseur.`;
  }

  if (!matchesTrainerTarget(card, pokemon, board, cellName)) {
    return `${pokemon.card.name} ne convient pas : choisis ${describeTrainerTarget(card)}.`;
  }

  if (card.effect === 'healPokemon') {
    if (pokemon.currentHp >= getPokemonMaxHp(pokemon)) return `${pokemon.card.name} a déjà tous ses PV.`;
    if (isHealBlocked(pokemon)) return `${pokemon.card.name} ne peut pas être soigné pendant ce tour.`;
  }

  if (card.effect === 'attachEnergy' && !canAttachEnergyFromSource(pokemon, 'hand')) {
    return `${pokemon.card.name} ne peut pas recevoir d'Énergies à cause d'une attaque adverse.`;
  }

  return null;
}

/** Le Pokémon respecte-t-il les contraintes `target` de la carte ? */
function matchesTrainerTarget(
  card: TrainerCard,
  pokemon: PokemonInPlay,
  board: BoardState,
  cellName: string
): boolean {
  const target = card.target;
  if (!target) return true;

  const normalize = (text: string) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  if (target.pokemonTypes?.length && !target.pokemonTypes.includes(pokemon.card.type)) return false;
  if (
    target.pokemonNames?.length &&
    !target.pokemonNames.some((name) => normalize(pokemon.card.name).startsWith(normalize(name)))
  ) {
    return false;
  }
  if (target.stages?.length && !target.stages.includes(pokemon.card.stage)) return false;
  if (target.variants?.length && !target.variants.includes(pokemon.card.variant)) return false;
  if (target.hasEnergyType && !pokemon.energies.includes(target.hasEnergyType)) return false;
  if (target.hasEnergy && pokemon.energies.length === 0) return false;

  const isActive = isActivePokemonCell(board, cellName);
  if (target.position === 'active' && !isActive) return false;
  if (target.position === 'bench' && isActive) return false;

  return true;
}

/** Au moins un Pokémon du joueur peut-il recevoir l'effet ? */
export function hasValidTrainerTarget(card: TrainerCard, board: BoardState, player: Player): boolean {
  return Object.keys(board).some(
    (cellName) => getTrainerTargetError(card, board, cellName, player) === null
  );
}

/**
 * Applique l'effet sur le Pokémon (déjà vérifié avec getTrainerTargetError).
 * Renvoie le message à afficher et le nouveau plateau.
 */
export function applyGenericTrainerEffect(
  card: TrainerCard,
  board: BoardState,
  cellName: string
): { board: BoardState; message: string } {
  const pokemon = board[cellName]!;

  if (card.effect === 'healPokemon') {
    const maxHp = getPokemonMaxHp(pokemon);
    const healed = Math.min(card.healAmount ?? 30, maxHp - pokemon.currentHp);

    return {
      board: { ...board, [cellName]: { ...pokemon, currentHp: pokemon.currentHp + healed } },
      message: `${card.name} : ${pokemon.card.name} récupère ${healed} PV.`,
    };
  }

  // attachEnergy
  // Sans `energyType` : une Énergie du type du Pokémon.
  const energyType =
    card.energyType ??
    (pokemon.card.type === 'dragon'
      ? (pokemon.card.dragonEnergyTypes?.[0] ?? 'normal')
      : pokemon.card.type);
  const amount = card.energyAmount ?? 1;

  return {
    board: {
      ...board,
      [cellName]: {
        ...pokemon,
        energies: [...pokemon.energies, ...Array(amount).fill(energyType)],
      },
    },
    message: `${card.name} : ${amount} Énergie(s) ${energyType} attachée(s) à ${pokemon.card.name}.`,
  };
}
