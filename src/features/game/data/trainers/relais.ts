import type { TrainerCard } from '@/features/game/types';

export const relais: TrainerCard = {
  id: 'relais-001',
  name: 'Relais Optimiste',
  category: 'objet',
  artwork: require('../../../../../assets/images/relais-card.png'),
  description:
    'Si le Pokémon auquel cette carte est attachée est mis K.O., déplacez 2 Énergies de ce Pokémon vers l’un de vos autres Pokémon.',

  effect: 'moveEnergyOnKO',
};
