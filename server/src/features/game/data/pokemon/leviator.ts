import type { PokemonCard } from '@/features/game/types';

export const leviator : PokemonCard = {
  id: 'leviator-001',          // unique dans tout le jeu
  name: 'Léviator',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 150,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/leviator-card.png'),
  attacks: [
    { name: 'Evacuation de Colère', damage: 0, energyCost: 2 ,
       bonusDamagePerOwnDiscardCard: {
    cardId: 'magicarpe-001',
    amount: 50,
  },
         effectText: 'Cette attaque inflige 50 dégats pour chaque Magicarpe dans votre pile de défausse.',
    },
    {
      name: 'Eclaboussure Brulante',
      damage: 160,
      energyCost: 4,
      requiredEnergies: { eau: 2 }, 
       ownBenchDamage: 30,
 effectText: 'Cette attaque inflige 30 dégats à chacun de vos Pokémons de Banc.',
    },
  ],
};