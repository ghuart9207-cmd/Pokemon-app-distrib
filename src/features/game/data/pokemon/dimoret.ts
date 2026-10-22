import type { PokemonCard } from '@/features/game/types';

export const dimoret: PokemonCard = {
  id: 'dimoret-001',
  name: 'Dimoret',
  stage: 'niveau1',
  variant: 'normal',
  type: 'obscurite',
  maxHp: 90,
  retreatCost: 0,
  artwork: require('../../../../../assets/images/dimoret-card.png'),
  attacks: [
    {
      name: 'Règne Maléfique',
      damage: 0,
      energyCost: 1,
      effects: [
  {
    type: 'damageAllPokemonWithTalent',
    amount: 60,
  },
],
effectText:
  "Cette attaque inflige 60 dégâts à chacun des Pokémon ayant un Talent, y compris les vôtres.",
    },
    {
      name: 'Tranche',
      damage: 70,
      energyCost: 2,

      requiredEnergies: {
        obscurite: 1,
      },

      
    },
  ],
};