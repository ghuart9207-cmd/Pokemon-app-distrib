import type { PokemonCard } from '@/features/game/types';

export const alakazamtcg: PokemonCard = {
  id: 'alakazamtcg-001',
  name: 'Alakazam',
  stage: 'niveau2',
  variant: 'normal',
  type: 'psy',
  maxHp: 130,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/alakazam-tcg.png'),
  
  attacks: [
   {
      name: 'Psyko',
      damage: 60,
      energyCost: 3,
      requiredEnergies: {
        psy: 1,
      },
      effects: [
    
     { type: 'damagePerOpponentActiveEnergy', amount: 30 },
  ],
   
    
  

  effectText:
    'Cette attaque inflige 30 dégâts supplémentaires pour chaque Énergie attachée au Pokémon Actifs de votre adversaire.',
    },
    
  ],
};