import type { TrainerCard } from '@/features/game/types';

export const echangemultiple: TrainerCard = {
  id: 'echangemultiple-001',
  name: 'Échange Multiple',
  category: 'objet',
  artwork: require('../../../../../assets/images/echangemultiple-card.png'),
  description: 'Déplacez une Énergie de l\'un de vos Pokémon vers un autre de vos Pokémon.',
  effect: 'script',
  script: [
  
   { action: 'moveEnergy', amount: 1, target: {side: 'own', who: 'chosen' }, to: {side: 'own', who: 'chosen' } }],

};