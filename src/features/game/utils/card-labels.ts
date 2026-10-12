import type { Attack, EnergyType, Stage, TrainerCard } from '@/features/game/types';

export function getTypeIcon(type: EnergyType) {
  switch (type) {
    case 'electrique':
      return '⚡';
    case 'feu':
      return '🔥';
    case 'eau':
      return '💧';
    case 'plante':
      return '🌿';
    case 'psy':
      return '🔮';
    case 'combat':
      return '🥊';
    case 'normal':
      return '⚪';
    case 'obscurite':
      return '🌑';
    case 'metal':
      return '⚙️';
    case 'fee':
      return '🐉';
    default:
      return '●';
  }
}

export function getStageName(stage: Stage) {
  switch (stage) {
    case 'base':
      return 'Base';
    case 'niveau1':
      return 'Niveau 1';
    case 'niveau2':
      return 'Niveau 2';
    case 'mega_ex':
      return 'Méga Pokémon-ex';
    default:
      return '';
  }
}

export function formatEnergies(energies: EnergyType[]) {
  if (energies.length === 0) {
    return 'Aucune';
  }

  return energies.map(getTypeIcon).join(' ');
}

export function formatAttackCost(attack: Attack) {
  const symbols: string[] = [];
  const requirements = attack.requiredEnergies ?? {};
  let requiredTotal = 0;

  for (const [type, amount] of Object.entries(requirements)) {
    const number = amount ?? 0;

    for (let index = 0; index < number; index++) {
      symbols.push(getTypeIcon(type as EnergyType));
    }

    requiredTotal += number;
  }

  const colorless = attack.energyCost - requiredTotal;

  for (let index = 0; index < colorless; index++) {
    symbols.push('◇');
  }

  return symbols.join(' ');
}

export function getTrainerCategoryLabel(card: TrainerCard) {
  return card.category === 'objet' ? 'Objet' : 'Supporter';
}

export function isPokemonTool(card: TrainerCard) {
  return card.category === 'objet' && card.subtype === 'outil';
}
