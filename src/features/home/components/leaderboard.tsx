import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-context';
import { getAvatarSource } from '@/features/auth/avatars';
import { fetchLeaderboard, type LeaderboardEntry } from '@/features/auth/leaderboard';
import { COLORS, FONTS } from '@/features/ui/theme';

// ---------------------------------------------------------------------
// RÉGLAGES (à modifier ici)
// ---------------------------------------------------------------------
/** Hauteur maximale de la liste (au-delà, on fait défiler). */
const LIST_MAX_HEIGHT = 360;
/** Taille de l'image de profil. */
const AVATAR_SIZE = 26;
/** Le classement se met à jour tout seul toutes les X secondes. */
const REFRESH_SECONDS = 60;

const MEDALS = ['🥇', '🥈', '🥉'];

/** Classement des joueurs par ELO (menu d'accueil, à droite). */
export function Leaderboard() {
  const { player } = useAuth();
  const [players, setPlayers] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchLeaderboard()
        .then((list) => {
          if (cancelled) return;
          setPlayers(list);
          setError(false);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    load();
    const timer = setInterval(load, REFRESH_SECONDS * 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // le classement change aussi quand on se connecte / termine une partie
  }, [player?.id, player?.elo]);

  return (
    <View style={styles.box}>
      <Text style={styles.title}>🏆 Classement</Text>

      {error && players === null ? (
        <Text style={styles.muted}>Serveur injoignable.</Text>
      ) : players === null ? (
        <Text style={styles.muted}>Chargement…</Text>
      ) : players.length === 0 ? (
        <Text style={styles.muted}>Aucun joueur pour l'instant.</Text>
      ) : (
        <ScrollView style={{ maxHeight: LIST_MAX_HEIGHT }}>
          {players.map((entry) => {
            const isMe = player?.id === entry.id;
            const source = getAvatarSource(entry.avatarUrl);
            return (
              <View key={entry.id} style={[styles.row, isMe && styles.rowMe]}>
                <Text style={styles.rank}>{MEDALS[entry.rank - 1] ?? `${entry.rank}.`}</Text>
                {source ? (
                  <Image source={source as never} style={styles.avatar} resizeMode="cover" />
                ) : (
                  <View style={[styles.avatar, styles.avatarEmpty]} />
                )}
                <Text style={[styles.pseudo, isMe && styles.pseudoMe]} numberOfLines={1}>
                  {entry.pseudo}
                </Text>
                <Text style={styles.elo}>{entry.elo}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = {
  box: {
    width: 280,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 6,
  },
  title: { color: COLORS.yellow, fontFamily: FONTS.button, fontSize: 16, marginBottom: 2 },
  muted: { color: COLORS.textMuted, fontSize: 14 },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  rowMe: { backgroundColor: COLORS.border },
  rank: { width: 30, color: COLORS.textMuted, fontFamily: FONTS.button, fontSize: 14, textAlign: 'center' as const },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: 6 },
  avatarEmpty: { backgroundColor: COLORS.background },
  pseudo: { flex: 1, color: COLORS.text, fontSize: 15 },
  pseudoMe: { color: COLORS.yellow, fontFamily: FONTS.button },
  elo: { color: COLORS.yellow, fontFamily: FONTS.button, fontSize: 15 },
};
