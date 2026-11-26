import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-context';
import { getAvatarSource } from '@/features/auth/avatars';
import { fetchMatchHistory, type MatchSide, type MatchSummary } from '@/features/auth/matches';
import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import { ALL_SERIES_POKEMON_CARDS } from '@/features/game/data';
import { COLORS, FONTS } from '@/features/ui/theme';

// =====================================================================
// JOURNAL DE COMBAT : les dernières parties EN LIGNE du joueur.
// Pour chaque partie : résultat, score, les deux joueurs (image de profil, pseudo, ELO)
// et les Pokémon de leurs decks.
// =====================================================================

// ---------------------------------------------------------------------
// TAILLES (à modifier ici)
// ---------------------------------------------------------------------
/** Taille des cartes : 1 = taille normale (comme dans la main), 0.6 = 60 %. */
const CARD_SCALE = 0.6;
/** Espace entre deux cartes. */
const CARD_GAP = 6;
/** Taille du score (« 70 - 160 »). */
const SCORE_SIZE = 48;
/** Taille de « VICTOIRE » / « DÉFAITE ». */
const RESULT_SIZE = 30;
/** Taille de l'image de profil. */
const AVATAR_SIZE = 48;
/** Largeur maximale d'un combat dans la liste. */
const MATCH_MAX_WIDTH = 1000;

// Taille normale d'une carte (la même que dans la main du joueur) : ne pas changer.
const BASE_CARD_WIDTH = 140;
const BASE_CARD_HEIGHT = 200;
const CARD_WIDTH = Math.round(BASE_CARD_WIDTH * CARD_SCALE);
const CARD_HEIGHT = Math.round(BASE_CARD_HEIGHT * CARD_SCALE);

const RESULT_LABEL = { win: 'VICTOIRE', loss: 'DÉFAITE', draw: 'ÉGALITÉ' } as const;
const RESULT_COLOR = { win: '#4CD964', loss: COLORS.red, draw: COLORS.textMuted } as const;

function findCard(id: string) {
  const baseId = id.split('~')[0];
  return ALL_SERIES_POKEMON_CARDS.find((card) => card.id === baseId) ?? null;
}

/** Carte complète (comme dans la main), réduite à CARD_SCALE. */
function SmallCard({ id }: { id: string | null }) {
  const card = id ? findCard(id) : null;
  if (!card) return <View style={[styles.card, styles.empty]} />;
  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>
        <PokemonHandCard card={card} />
      </View>
    </View>
  );
}

function formatDate(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Image de profil (carré). */
function Avatar({ avatarUrl }: { avatarUrl: string | null }) {
  const source = getAvatarSource(avatarUrl);
  return source ? (
    <Image source={source as never} style={styles.avatar} resizeMode="cover" />
  ) : (
    <View style={[styles.avatar, styles.empty]} />
  );
}

/** Un joueur : image de profil, pseudo, ELO, puis ses Pokémon (2 lignes de 4). */
function PlayerColumn({ side, align }: { side: MatchSide; align: 'left' | 'right' }) {
  const right = align === 'right';
  const slots = Array.from({ length: 8 }, (_, index) => side.cards[index] ?? null);

  return (
    <View style={styles.column}>
      <View style={[styles.identity, right && styles.identityRight]}>
        <Avatar avatarUrl={side.avatarUrl} />
        <View style={right ? styles.alignRight : undefined}>
          <Text style={styles.pseudo} numberOfLines={1}>
            {side.pseudo}
          </Text>
          {/* ELO juste avant la partie (anciennes parties : ELO actuel) */}
          {(side.eloBefore ?? side.eloAfter) !== null && (
            <Text style={styles.elo}>ELO {side.eloBefore ?? side.eloAfter}</Text>
          )}
        </View>
      </View>

      <View style={styles.cardGrid}>
        {slots.map((id, index) => (
          <SmallCard key={index} id={id} />
        ))}
      </View>
    </View>
  );
}

function MatchCard({ match }: { match: MatchSummary }) {
  const { me, opponent, result } = match;
  const eloChange = me.eloBefore !== null && me.eloAfter !== null ? me.eloAfter - me.eloBefore : null;

  return (
    <View style={styles.match}>
      {/* Résultat à gauche, score au milieu, date à droite */}
      <View style={styles.header}>
        <Text style={[styles.result, styles.headerSide, { color: RESULT_COLOR[result] }]}>
          {RESULT_LABEL[result]}
        </Text>
        <Text style={styles.score}>
          {me.score !== null && opponent.score !== null ? `${me.score} - ${opponent.score}` : ''}
        </Text>
        <Text style={[styles.date, styles.headerSide]}>{formatDate(match.endedAt)}</Text>
      </View>

      <View style={styles.players}>
        <PlayerColumn side={me} align="left" />
        <Text style={styles.versus}>VS</Text>
        <PlayerColumn side={opponent} align="right" />
      </View>

      {eloChange !== null && (
        <Text style={[styles.eloChange, { color: eloChange >= 0 ? '#4CD964' : COLORS.red }]}>
          {eloChange >= 0 ? '+' : ''}
          {eloChange} ELO
        </Text>
      )}
    </View>
  );
}

export default function MatchHistoryScreen() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Connecte-toi pour voir ton journal de combat.');
      return;
    }
    fetchMatchHistory(token)
      .then(setMatches)
      .catch((reason: Error) => setError(reason.message));
  }, [token]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? (
          <Text style={styles.message}>{error}</Text>
        ) : matches === null ? (
          <ActivityIndicator color={COLORS.yellow} size="large" />
        ) : matches.length === 0 ? (
          <Text style={styles.message}>Aucun combat en ligne pour l'instant.</Text>
        ) : (
          matches.map((match) => <MatchCard key={match.id} match={match} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 16, alignItems: 'center' as const },
  message: { color: COLORS.textMuted, fontSize: 16, marginTop: 40, textAlign: 'center' as const },
  match: {
    width: '100%' as const,
    maxWidth: MATCH_MAX_WIDTH,
    padding: 16,
    gap: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 },
  headerSide: { flex: 1 },
  result: { fontFamily: FONTS.title, fontSize: RESULT_SIZE, letterSpacing: 1 },
  score: { fontFamily: FONTS.title, fontSize: SCORE_SIZE, color: COLORS.text, textAlign: 'center' as const },
  date: { color: COLORS.textMuted, fontSize: 13, textAlign: 'right' as const },
  players: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  column: { gap: 10, flexShrink: 1 },
  identity: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  identityRight: { flexDirection: 'row-reverse' as const },
  alignRight: { alignItems: 'flex-end' as const },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: 8, borderWidth: 2, borderColor: COLORS.border },
  pseudo: { color: COLORS.text, fontFamily: FONTS.button, fontSize: 17, maxWidth: 180 },
  elo: { color: COLORS.textMuted, fontSize: 14 },
  cardGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: CARD_GAP,
    width: CARD_WIDTH * 4 + CARD_GAP * 3,
  },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 10, overflow: 'hidden' as const },
  // la carte est dessinée à sa taille normale puis réduite
  cardInner: {
    width: BASE_CARD_WIDTH,
    height: BASE_CARD_HEIGHT,
    transform: [{ scale: CARD_SCALE }],
    transformOrigin: 'top left',
  },
  empty: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  versus: { fontFamily: FONTS.title, fontSize: 32, color: COLORS.yellow },
  eloChange: { fontFamily: FONTS.button, fontSize: 18 },
};
