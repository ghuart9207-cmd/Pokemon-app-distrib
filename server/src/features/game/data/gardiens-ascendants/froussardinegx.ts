import type { PokemonCard } from '@/features/game/types';

export const froussardinegx: PokemonCard = {
  id: 'froussardinegx-001',          // unique dans tout le jeu
  name: 'Froussardine GX',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'gx',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 210,
  retreatCost: 3,
  artwork: require('../../../../../assets/images/froussardinegx-card.png'),
  attacks: [
    {
      name: 'Pistolet à O',
      damage: 20,
       
      energyCost: 1,
      requiredEnergies: { eau: 1 }, 
        

      
},
{
      name: 'Vortex Torrentiel',
      damage: 120,
       
      energyCost: 5,
      requiredEnergies: { eau: 3 }, 
        effects: [{ type: 'discardOpponentActiveTool', amount: 1 }],
  effectText: 'Défaussez une carte Outil Pokémon attachée au Pokémon Actif de votre adversaire.',

        
},
],
};