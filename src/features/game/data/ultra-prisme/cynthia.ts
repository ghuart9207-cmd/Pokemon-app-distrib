import type { TrainerCard } from '@/features/game/types';

export const cynthia: TrainerCard = {
  id: 'cynthia-upr-001',
  name: 'Cynthia',
  
  category: 'supporter',
     artwork: require('../../../../../assets/images/cynthia-card.png'),
  
  description:
    "Pendant ce tour, l'attaque Lames Royales de vos Carchacrok inflige 100 dégâts supplémentaires.",

  effect: 'boostPokemonAttackThisTurn',

  // Réglages de l'effet :
  boostPokemonName: 'Carchacrok',
  boostAttackName: 'Lames Royales',
  boostAmount: 100,
};
