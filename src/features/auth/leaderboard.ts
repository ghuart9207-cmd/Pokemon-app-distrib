import { apiRequest } from './api';

/** Un joueur du classement. */
export type LeaderboardEntry = {
  rank: number;
  id: number;
  pseudo: string;
  avatarUrl: string | null;
  elo: number;
  wins: number;
  losses: number;
};

/** Le classement des joueurs par ELO (accessible sans être connecté). */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const data = await apiRequest<{ players: LeaderboardEntry[] }>('/leaderboard');
  return data.players;
}
