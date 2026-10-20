import type { PokemonCard } from '@/features/game/types';

export const psytigri: PokemonCard = {
  id: 'psytigri-001',
  name: 'Psytigri',
  stage: 'base',
  variant: 'normal',
  type: 'psy',
  maxHp: 60,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/psytigri-card.png'),
  attacks: [
    {
      name: 'Regard Déroutant',
      damage: 0,
      energyCost: 1,
      effects: [ {type: 'takeExtraDamageNextTurn',     amount: 20,energyType: 'psy',  },  ],
      effectText:    'Pendant votre prochain tour, le Pokémon Défenseur subit 60 dégâts supplémentaires venant des attaques de type psy.', } ,
    
   
  ],
};