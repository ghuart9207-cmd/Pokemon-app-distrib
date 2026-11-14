import type { PokemonCard } from '@/features/game/types';

export const hypocean: PokemonCard = {
  id: 'hypocean-001',          // unique dans tout le jeu
  name: 'Hypocéan',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'eau',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 80,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/hypocean-card.png'),
  attacks: [
    {
      name: 'Flèche d’eau',
      damage: 30,
        targetMode: 'anyOpponentPokemon',
      energyCost: 1,
      requiredEnergies: { eau: 1 }, 
        

         effectText:
    'Cette attaque inflige 30 dégats à l’un des pokémons de votre adversaire.',
},
],
};