import type { TrainerCard } from '@/features/game/types';

export const potion: TrainerCard = {
  id: 'potion-001',
  name: 'Potion',
  category: 'objet',
  artwork: require('../../../../../assets/images/potion-card.png'),
  description: 'Soigne 30 dégâts à un de tes Pokémon.',
  effect: 'heal30',
};
