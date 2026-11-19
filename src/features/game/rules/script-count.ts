import type {
  Attack,
  BoardState,
  EnergyType,
  GameCard,
  Player,
  ScriptBlock,
  ScriptCount,
} from '@/features/game/types';
import { getPokemonMaxHp } from './board-rules';
import { matchesCardFilter } from './script-cards';
import { isFrontPokemonCell, matchesPokemonFilter } from './script-modifiers';

// =====================================================================
// CODE DES CARTES — « pour chaque … » (`per`) et dégâts d'attaque en plus
// =====================================================================

export type ScriptCountContext = {
  board: BoardState;
  // joueur qui joue la carte
  player: Player;
  // case du Pokémon qui attaque / a le talent (null pour un Dresseur)
  sourceCell: string | null;
  player1Discard: GameCard[];
  player2Discard: GameCard[];
  player1Hand: GameCard[];
  player2Hand: GameCard[];
  player1DiscardEnergies?: EnergyType[];
  player2DiscardEnergies?: EnergyType[];
};

function sidePlayers(per: ScriptCount, player: Player): Player[] {
  const opponent: Player = player === 1 ? 2 : 1;
  const side = per.side ?? 'own';
  return side === 'own' ? [player] : side === 'opponent' ? [opponent] : [player, opponent];
}

/** Combien de … ? (le nombre par lequel on multiplie `amount`) */
export function computeScriptCount(per: ScriptCount, context: ScriptCountContext): number {
  const players = sidePlayers(per, context.player);

  switch (per.count) {
    case 'discard':
    case 'hand': {
      return players.reduce((total, player) => {
        const cards =
          per.count === 'discard'
            ? player === 1
              ? context.player1Discard
              : context.player2Discard
            : player === 1
              ? context.player1Hand
              : context.player2Hand;
        return total + cards.filter((card) => matchesCardFilter(card, per.cards)).length;
      }, 0);
    }

    case 'discardEnergy': {
      return players.reduce((total, player) => {
        const energies = (player === 1 ? context.player1DiscardEnergies : context.player2DiscardEnergies) ?? [];
        return total + energies.filter((energy) => !per.energyType || energy === per.energyType).length;
      }, 0);
    }

    default: {
      // Pokémon concernés
      const who = per.who ?? 'all';
      const sourceColumn = context.sourceCell ? context.sourceCell.slice(1) : null;

      const cells = Object.keys(context.board).filter((cell) => {
        const pokemon = context.board[cell];
        if (!pokemon || !players.includes(pokemon.owner)) return false;
        if (who === 'self' && cell !== context.sourceCell) return false;
        if (who === 'active') {
          if (!isFrontPokemonCell(context.board, cell)) return false;
          // l'actif de la colonne du Pokémon source (s'il y en a un)
          if (sourceColumn && cell.slice(1) !== sourceColumn) return false;
        }
        return matchesPokemonFilter(pokemon, per.filter, context.board, cell);
      });

      return cells.reduce((total, cell) => {
        const pokemon = context.board[cell]!;
        switch (per.count) {
          case 'pokemon':
            return total + 1;
          case 'energy':
            return total + pokemon.energies.filter((energy) => !per.energyType || energy === per.energyType).length;
          case 'damageCounters':
            return total + Math.max(0, Math.floor((getPokemonMaxHp(pokemon) - pokemon.currentHp) / 10));
          case 'tools':
            return total + (pokemon.attachedTool ? 1 : 0);
          default:
            return total;
        }
      }, 0);
    }
  }
}

/** Valeur d'un bloc : `amount`, multiplié par `per` s'il y en a un. */
export function getScriptBlockAmount(block: ScriptBlock, context: ScriptCountContext): number {
  const amount = block.amount ?? 0;
  return block.per ? amount * computeScriptCount(block.per, context) : amount;
}

/** Dégâts en plus de l'attaque (blocs `attackDamage` de son script). */
export function getScriptAttackDamageBonus(attack: Attack, context: ScriptCountContext): number {
  return (attack.script ?? [])
    .filter((block) => block.action === 'attackDamage')
    .reduce((total, block) => total + getScriptBlockAmount(block, context), 0);
}
