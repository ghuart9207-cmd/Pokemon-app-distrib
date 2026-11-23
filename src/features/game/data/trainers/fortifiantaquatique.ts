import type { TrainerCard } from '@/features/game/types';

export const fortifiantaquatique: TrainerCard = {
  id: 'fortifiantaquatique-001',
  name: 'Fortifiant Aquatique',
  category: 'objet',
  artwork: require('../../../../../assets/images/fortifiantaquatique-card.png'),
  description: 'Attachez une Energie Eau de votre pile de défausse à l\'un de vos Pokémon Eau.',
  effect: 'script',
  script: [
  {
   action: 'attachEnergy', amount: 1,  fromDiscard: true, energyType: 'eau',      
                
      target: { side: 'own', who: 'chosen', filter: { pokemonTypes: ['eau'] } },},],

};