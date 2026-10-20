import type { PokemonCard } from '@/features/game/types';

export const gardevoirgx: PokemonCard = {
  id: 'gardevoirgx-001',          // unique dans tout le jeu
  name: 'Gardevoir GX',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'gx',            // 'normal' | 'ex' | 'gx'
  type: 'fee',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 230,
  retreatCost: 2,
  artwork: require('../../../../../assets/images/gardevoirgx-card.png'),
  talent: {
  name: 'Rebond Secret',
  type: 'activated',
  effect: 'attachEnergyOncePerTurn',
  energyType: 'fee',
  targetPokemonType: 'fee',
  amount: 1,
  description:
    'Une fois pendant votre tour, attachez une Énergie Fée à l’un de vos Pokémon Fée.',
},
  attacks: [
    
    {
      name: 'Force Infinie',
      damage: 0,
      energyCost: 1,
      requiredEnergies: { fee: 1 }, // optionnel : énergies de types précis
      effects: [
    {
      type: 'damagePerAttachedEnergy',
      amount: 30,
    },
     {
    type: 'bonusDamageIfOpponentActiveHasEnergy',
    amount: 30,
  },
  ],
   
    
  

  effectText:
    'Cette attaque inflige 30 dégâts pour chaque Énergie attachée à ce Pokémon + 30 dégats supplémentaire si le Pokémon actif de votre adversaire possède au moins une énergie.',
    },
  ],
};