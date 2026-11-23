import type { TrainerCard } from './cards';

/** Outil attaché affiché au joueur (carte et case du Pokémon qui le porte). */
export type SelectedAttachedTool = {
  card: TrainerCard;
  cellName: string;
};
