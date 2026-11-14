import type { PokemonCard } from '@/features/game/types';

export const anchwatt: PokemonCard = {
  id: 'anchwatt-001',          // unique dans tout le jeu
  name: 'Anchwatt',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'electrique',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 40,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/anchwatt-card.png'),
  attacks: [
    {
      name: 'Choc Aquatique',
      damage: 10,
      energyCost: 1,
      requiredEnergies: { electrique: 1 }, 
       
    effects: [
    {
      type: 'bonusDamageIfDefenderHasEnergy',
      energyType: 'eau',
      amount: 30,
    },
  ],

  effectText:
    "Si de l’énergie Eau est attachée au Pokémon Actif de votre adversaire, cette attaque inflige 30 dégats supplémentaire.",
       
},
],
};