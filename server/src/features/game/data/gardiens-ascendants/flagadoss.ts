import type { PokemonCard } from '@/features/game/types';

export const flagadoss: PokemonCard = {
  id: 'flagadoss-001',          // unique dans tout le jeu
  name: 'Flagadoss',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'psy',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 110,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/flagadoss-card.png'),
  attacks: [
    {
      name: 'Amnésie',
      damage: 20,
      energyCost: 1,
        
      
        script: [
  


  { action: 'prevent', prevent: ['attack'], chooseAttack: true,
    target: { side: 'opponent', who: 'active' }, duration: 'opponentNextTurn' },
],
  effectText: 'Choisissez une attaque du pokémon actif de votre adversaire, celui ci ne pourras pas l\'utiliser lors du prochain tour de votre adversaire.',

    },
    {
  name: 'Façade',
  damage: 50,
  energyCost: 3,
  script: [
    {
      action: 'attackDamage',
      amount: 80,
      per: {
        count: 'pokemon',
        side: 'opponent',
        who: 'active',
        filter: { conditions: ['poison', 'burn'] },
      },
    },
  ],
  effectText:
    "Si le Pokémon actif de votre adversaire est Empoisonné ou Brûlé, cette attaque inflige 80 dégâts supplémentaires.",
},
  ],
};