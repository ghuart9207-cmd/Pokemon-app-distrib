import type { TrainerCard } from '@/features/game/types';

export const flo: TrainerCard = {
  id: 'flo-001',
  name: 'Flo',
  category: 'supporter',
   artwork: require('../../../../../assets/images/flo-card.png'),

  description:
    "Soignez 80 dégâts à l'un de vos Pokémon auquel une Énergie Plante est attachée.",

  effect: 'script',
  script: [
  {
  action: 'heal',          
  amount: 80,              
      target: { side: 'own', who: 'chosen', filter: { hasEnergyType: 'plante'  } },
}
  ],
};
