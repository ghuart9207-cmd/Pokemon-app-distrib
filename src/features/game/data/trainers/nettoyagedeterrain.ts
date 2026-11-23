import type { TrainerCard } from '@/features/game/types';

export const nettoyagedeterrain: TrainerCard = {
  id: 'nettoyagedeterrain-001',
  name: 'Nettoyage de Terrain',
  category: 'objet',
  artwork: require('../../../../../assets/images/nettoyagedeterrain-card.png'),
  description: 'Défaussez une carte Outil de l\'un des Pokémon de votre adversaire.',
  effect: 'script',
  script: [
  {
   action: 'discardTool', amount: 1,        
                
      target: { side: 'opponent', who: 'chosen',  },},],

};