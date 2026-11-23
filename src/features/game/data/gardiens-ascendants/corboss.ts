import type { PokemonCard } from '@/features/game/types';

export const corboss: PokemonCard = {
  id: 'corboss-001',          // unique dans tout le jeu
  name: 'Corboss',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'obscurite',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 110,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/corboss-card.png'),
  attacks: [
    {
      name: 'Feinte',
      damage: 0,
      energyCost: 1,
        requiredEnergies: { obscurite: 1},
      script: [
        { action: 'counters', amount: 3,target: { side: 'opponent' , who: 'chosen'} } ],
  effectText: 'Cette attaque inflige 30 dégâts à l\'un des Pokémon de votre adversaire. Ces dégâts ne sont pas affectés par les effets en action.',

    },
    {
      name: 'Serre de Corbeau',
      damage: 10,
      energyCost: 2,
      
         script: [
    { action: 'attackDamage', amount: 10,
      per: { count: 'damageCounters', side: 'opponent' } },
  ],
  effectText:
    "Cette attaque inflige 10 dégâts supplémentaires pour chaque marqueur de dégâts placé sur les Pokémon de votre adversaire.",

    },
  ],
};