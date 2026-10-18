import type { EnergyType } from '@/features/game/types';

export function getTypeCardColors(type: EnergyType) {
  switch (type) {
    case 'electrique':
      return {
        card: '#F7E08A',
        header: '#F2D24B',
        border: '#D4AF37',
        attackBg: '#F6E79F',
      };
    case 'combat':
      return {
        card: '#D9C3B0',
        header: '#B8875C',
        border: '#8B5E3C',
        attackBg: '#E8D7C8',
      };
    case 'feu':
      return {
        card: '#F7C29D',
        header: '#F08B4F',
        border: '#D46A1F',
        attackBg: '#F9D1B5',
      };
    case 'eau':
      return {
        card: '#B8D9F8',
        header: '#6AAAE8',
        border: '#3E84C6',
        attackBg: '#CFE5FA',
      };
    case 'plante':
      return {
        card: '#BFE3B4',
        header: '#75B86A',
        border: '#4E8F45',
        attackBg: '#D2ECCB',
      };
    case 'psy':
      return {
        card: '#D9C2F0',
        header: '#A77DD6',
        border: '#7C56B1',
        attackBg: '#E5D7F7',
      };
      
    // TYPE MÉTAL
    case 'metal':
      return {
        card: '#CDD6DC',
        header: '#A5B4BF',
        border: '#657987',
        attackBg: '#E1E7EB',
      };

    // TYPE OBSCURITÉ
    case 'obscurite':
      return {
        card: '#D4CCDF',
        header: '#A99ABB',
        border: '#695779',
        attackBg: '#E5DFED',
      };

    // TYPE DRAGON
    case 'dragon':
      return {
        card: '#E8D49A',
        header: '#D6B45D',
        border: '#9F7929',
        attackBg: '#F3E4BA',
      };

    // TYPE FÉE
    case 'fee':
      return {
        card: '#F7C8E1',
        header: '#EE94C4',
        border: '#CD609E',
        attackBg: '#FADDED',
      };

    default:
      return {
        card: '#E8E8E8',
        header: '#D8D8D8',
        border: '#B8B8B8',
        attackBg: '#EFEFEF',
      };
  }
}
