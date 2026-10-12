import type { TrainerCard } from '@/features/game/types';

export const margie: TrainerCard = {
  id: 'margie-001',
  name: 'Margie',
  category: 'supporter',
  description:
    'Placez l’un de vos pokémon avec des marqueurs de dégâts et les cartes outils qui lui sont attachées dans votre main.',

  effect: 'returnPokemonToHand',

  artwork: require('../../../../../assets/images/margie-card.png'),
};
