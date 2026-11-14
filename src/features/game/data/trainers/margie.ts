import type { TrainerCard } from '@/features/game/types';

export const margie: TrainerCard = {
  id: 'margie-001',
  name: 'Margie',
  category: 'supporter',
  description:
    'Placez l’un de vos pokémon avec des marqueurs de dégâts et les cartes outils qui lui sont attachées dans votre main, mais sans énergie.',

  effect: 'returnPokemonToHand',

  // Le Pokémon peut être reposé en plus de la pose du tour, sans Énergie.
  returnToHandReplacement: 'free',

  artwork: require('../../../../../assets/images/margie-card.png'),
};
