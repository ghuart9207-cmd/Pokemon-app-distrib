import type { TrainerCard } from '@/features/game/types';

export const flo: TrainerCard = {
  id: 'flo-001',
  name: 'Flo',
  category: 'supporter',
   artwork: require('../../../../../assets/images/flo-card.png'),

  description:
    "Soignez 80 dégâts à l'un de vos Pokémon auquel une Énergie Plante est attachée.",

  effect: 'healPokemonWithEnergyType',

 
  healAmount: 80,
  healEnergyType: 'plante',
};
