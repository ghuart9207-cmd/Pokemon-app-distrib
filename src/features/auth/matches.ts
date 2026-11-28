import { apiRequest } from './api';

/** Un joueur dans une partie du journal de combat. */
export type MatchSide = {
  id: number | null;
  pseudo: string;
  avatarUrl: string | null;
  /** Dégâts infligés au joueur adverse (null pour les anciennes parties). */
  score: number | null;
  eloBefore: number | null;
  eloAfter: number | null;
  /** Identifiants des Pokémon de son deck. */
  cards: string[];
};

/** Une partie en ligne, vue par le joueur connecté (`me`). */
export type MatchSummary = {
  id: number;
  endedAt: string | null;
  /** true : partie classée ; false : amicale (pas d'ELO). */
  ranked: boolean;
  result: 'win' | 'loss' | 'draw';
  me: MatchSide;
  opponent: MatchSide;
};

/** Les dernières parties en ligne du joueur connecté. */
export async function fetchMatchHistory(token: string): Promise<MatchSummary[]> {
  const data = await apiRequest<{ matches: MatchSummary[] }>('/matches', { token });
  return data.matches;
}
