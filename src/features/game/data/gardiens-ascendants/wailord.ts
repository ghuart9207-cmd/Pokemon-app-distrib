import type { PokemonCard } from '@/features/game/types';

export const wailord: PokemonCard = {
  id: 'wailord-001',
  name: 'Wailord',
  stage: 'niveau1',
  variant: 'normal',
  type: 'eau',
  maxHp: 200,
  retreatCost: 4,
  artwork: require('../../../../../assets/images/wailord-card.png'),
  attacks: [
    
    {
      name: 'Plongée',
      damage: 40,
      energyCost: 3,

      requiredEnergies: {
        eau: 2,
      },
      coinCount: 1,

  coinEffects: [
    {
      side: 'face',
      effect: {
        type: 'preventAllAttackDamageAndEffectsNextOpponentTurn',
        amount: 1,
      },
    },
],
         effectText:
    'Lancez une pièce. Si c’est Face, évitez tous les effets d’attaques y compris les dégâts infligés à ce Pokémon pendant le prochain tour de votre adversaire.',
    },
    {
      name: 'Grande Bleue',
      damage: 80,
      energyCost: 4,

      requiredEnergies: {
        eau: 3,
      },
      effects: [  {    type: 'healPokemonByType',    amount: 30,    pokemonType: 'eau',  },],
      effectText: 'Soignez 30 dégats à chacun de vos Pokémon Eau.' 
    },
      
    ],
};