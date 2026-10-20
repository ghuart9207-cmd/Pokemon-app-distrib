import type { PokemonCard } from '@/features/game/types';

export const diancie: PokemonCard = {
  id: 'diancie-001',          // unique dans tout le jeu
  name: 'Diancie',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'fee',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 90,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/diancie-card.png'),
  attacks: [
    { name: 'Espoir Etincelant', damage: 0, energyCost: 1,requiredEnergies: { fee: 1 }},
    {
      name: 'Orage Adamantin',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { fee: 1 }, // optionnel : énergies de types précis
      
effects: [
  {
    type: 'healPokemonByType',
    amount: 30,
    pokemonType: 'fee',
  },
],
effectText:
  'Soigne 30 dégâts à chacun des Pokémon de type Fée.',

    },
  ],
};