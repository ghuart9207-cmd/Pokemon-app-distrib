import type { CellPressContext } from '@/features/game/hooks/cell-press/cell-press-context';
import type { PokemonInPlay, TrainerCard } from '@/features/game/types';

/** Contexte d'un effet de carte Dresseur appliqué sur la case cliquée. */
export type TrainerEffectContext = CellPressContext & {
  cellName: string;
  selectedTrainerCard: TrainerCard;
  /** Pokémon présent sur la case cliquée (`null` si la case est vide). */
  target: PokemonInPlay | null;
};

/** Même chose, une fois vérifié que la case cliquée contient bien un Pokémon. */
export type TrainerTargetEffectContext = TrainerEffectContext & {
  target: PokemonInPlay;
};
