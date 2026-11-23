import type { PokemonCard } from '@/features/game/types';

export const farfuret: PokemonCard = {
  id: 'farfuret-001',          // unique dans tout le jeu
  name: 'Farfuret',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'obscurite',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/farfuret-card.png'),
  attacks: [
    {
      name: 'Aiguisage',
      damage: 0,
      energyCost: 1,
      
       effects: [
  {
    type: 'setNextTurnAttackBaseDamage',
    amount: 80,
    attackName: 'Tranche',
  },
],
effectText:
  "Pendant votre prochain tour, les dégâts de base de Tranche sont de 80.",

 
         
},
{
      name: 'Tranche',
      damage: 20,
      energyCost: 2,
      requiredEnergies: { obscurite: 1 }, 
       

 
         
},
],
};