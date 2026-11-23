import type { PokemonCard } from '@/features/game/types';

export const dardargnanextcg: PokemonCard = {
  id: 'dardargnanextcg-001',          // unique dans tout le jeu
  name: 'Dardargnan EX',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'ex',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 170,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/dardargnanex-tcg.png'),
  attacks: [
    {
      name: 'Lance Destructrice',
      damage: 80,
        
      energyCost: 2,
      requiredEnergies: { plante: 2 }, 
        effects: [  {    type: 'discardOpponentActiveEnergy',    amount: 1,  },],
effectText:  "Défaussez une Énergie du Pokémon Actif de votre adversaire.",


      
},
],
}