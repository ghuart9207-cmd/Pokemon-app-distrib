import type { TrainerCard } from '@/features/game/types';

export const potionmax: TrainerCard = {
  id: 'potionmax-001',
  name: 'Potion Max',
  category: 'objet',
  artwork: require('../../../../../assets/images/potionmax-card.png'),
  description: 'Soignez tous les degâts de l\'un de vos Pokémon mais défaussez lui toutes ses Energies.',
  effect: 'script',
  script: [
  {
   action: 'heal', amount: 999,      
                
      target: { side: 'own', who: 'chosen',  },},
     { action: 'discardEnergy', amount: 99, target: { who: 'previous' } },
    ],

};