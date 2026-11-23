import type { AttackEffect, BoardState, GameCard, Player, PokemonCard } from '@/features/game/types';

import { isPokemonCard } from './board-rules';
import { DEFAULT_INVOCATION_MAX_HP } from './invocation-pool-rules';

/**
 * Effet 'summonFromAnyDiscard' : invoquer un Pokémon de Base (type `pokemonType`,
 * `maxHp` PV ou moins) depuis VOTRE défausse sur VOTRE banc, ou depuis la défausse
 * ADVERSE sur le banc ADVERSE. Il arrive comme une Invocation (0 Énergie).
 */
export type DiscardSummonCandidate = {
  fromPlayer: Player;
  discardIndex: number;
  card: PokemonCard;
};

export function isValidDiscardSummon(card: GameCard, rule: AttackEffect): card is PokemonCard {
  return (
    isPokemonCard(card) &&
    card.stage === 'base' &&
    card.maxHp <= (rule.maxHp ?? DEFAULT_INVOCATION_MAX_HP) &&
    (rule.pokemonType === undefined || card.type === rule.pokemonType)
  );
}

export function getBenchRow(player: Player): 'B' | 'C' {
  return player === 1 ? 'B' : 'C';
}

export function hasFreeBenchCell(board: BoardState, player: Player): boolean {
  const row = getBenchRow(player);
  return [1, 2, 3, 4].some((column) => board[`${row}${column}`] === null);
}

/** Pokémon invocables, dans les défausses dont le banc a encore une case libre. */
export function getDiscardSummonCandidates(
  rule: AttackEffect,
  board: BoardState,
  player1Discard: GameCard[],
  player2Discard: GameCard[]
): DiscardSummonCandidate[] {
  const candidates: DiscardSummonCandidate[] = [];

  ([1, 2] as Player[]).forEach((fromPlayer) => {
    if (!hasFreeBenchCell(board, fromPlayer)) return;

    const discard = fromPlayer === 1 ? player1Discard : player2Discard;

    discard.forEach((card, discardIndex) => {
      if (isValidDiscardSummon(card, rule)) {
        candidates.push({ fromPlayer, discardIndex, card });
      }
    });
  });

  return candidates;
}
