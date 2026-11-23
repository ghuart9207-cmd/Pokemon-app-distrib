import type { PokemonCard } from '@/features/game/types';

export const tarenbulle: PokemonCard = {
  id: 'tarenbulle-001',          // unique dans tout le jeu
  name: 'Tarenbulle',
  stage: 'niveau1',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'plante',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 100,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/tarenbulle-card.png'),
  attacks: [
    { name: 'Filet de Bulles', damage: 30, energyCost: 2,
       effects: [
    {
      type: 'blockEnergyAttachmentFromHand',
      amount: 0,
    },
  ],

  effectText:
    "Pendant le prochain tour de votre adversaire, aucune Énergie ne peut être attachée depuis sa main au Pokémon Défenseurs.",
    },
    {
      name: 'Croc Aiguisé',
      damage: 80,
      energyCost: 3,
      requiredEnergies: { plante: 1 }, // optionnel : énergies de types précis
    },
  ],
};