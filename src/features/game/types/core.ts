export type Player = 1 | 2;

export type SetupPhase = 'player1' | 'player2' | 'battle';

/** Série de cartes d'une partie. Les deux séries ne se mélangent jamais. */
export type CardSeries = 'soleil-lune' | 'tcg-pocket';

export type Stage = 'base' | 'niveau1' | 'niveau2' | 'mega_ex';

/** États spéciaux. */
export type SpecialCondition = 'poison' | 'burn' | 'paralyze' | 'confuse' | 'sleep';

export type CardVariant = 'normal' | 'ex' | 'gx';

export type EnergyType =
  | 'electrique'
  | 'feu'
  | 'eau'
  | 'plante'
  | 'psy'
  | 'combat'
  | 'normal'
  | 'obscurite'
  | 'metal'
  | 'fee'
  | 'dragon';
