import type {
  CardVariant,
  EnergyType,
  GameCard,
  PokemonInPlay,
  Stage,
} from '@/features/game/types';

export function getKOPenalty(stage: Stage, variant: CardVariant) {
  if (variant === 'ex' || variant === 'gx') {
    return 50;
  }

  switch (stage) {
    case 'base':
      return 10;
    case 'niveau1':
      return 20;
    case 'niveau2':
      return 30;
    case 'mega_ex':
      return 100;
    default:
      return 0;
  }
}

export function getKnockoutConsequences(pokemon: PokemonInPlay[]): {
  penalty: number;
  discardedCards: GameCard[];
  discardedEnergies: EnergyType[];
} {
  return {
    penalty: pokemon.reduce(
      (total, knockedOut) =>
        total + getKOPenalty(knockedOut.card.stage, knockedOut.card.variant),
      0
    ),
    discardedCards: pokemon.flatMap((knockedOut) => [
      knockedOut.card,
      ...(knockedOut.attachedTool ? [knockedOut.attachedTool] : []),
    ]),
    discardedEnergies: pokemon.flatMap((knockedOut) => knockedOut.energies),
  };
}
