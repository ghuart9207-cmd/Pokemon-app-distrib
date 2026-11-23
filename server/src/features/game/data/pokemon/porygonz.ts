import type { PokemonCard } from '@/features/game/types';

export const porygonz: PokemonCard = {
  id: 'porygonz-001',
  name: 'Porygon-Z',
  stage: 'niveau2',
  variant: 'normal',
  type: 'normal',
  maxHp: 130,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/porygonz-card.png'),
  attacks: [
    

    {
      name: 'Élecanon',
      damage: 80,
      energyCost: 3,
      

      blocksNextOwnTurn: true,
      effectText:
        'Ce Pokémon ne peut pas utiliser Élecanon pendant votre prochain tour.',
    },
  ],
};