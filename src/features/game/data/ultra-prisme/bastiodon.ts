import type { PokemonCard } from '@/features/game/types';

export const bastiodon: PokemonCard = {
  id: 'bastiodon-001',          // unique dans tout le jeu
  name: 'Bastiodon',
  stage: 'niveau2',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'metal',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 160,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/bastiodon-card.png'),
  talent: {
  name: 'Bouclier de Terre',
  type: 'passive',
  effect: 'preventDamageToTypeFromToolAttackers',
  description:
    "Évitez tous les dégâts d'attaques infligés à vos Pokémon de type Métal par les Pokémon de votre adversaire auxquels est attachée une carte Outil.",
},
  attacks: [
    
    {
      name: 'Recul',
      damage: 110,
      energyCost: 3,
      requiredEnergies: { metal: 2 }, 
      
    effects: [        {          type:            'forceOpponentActiveSwitch',          amount: 1,  optional: true,          },     ],
  
   
    
  

  effectText: "Vous pouvez faire échanger le Pokémon Actif de votre adversaire avec l'un de ses Pokémon de Banc.",
    },
  ],
};