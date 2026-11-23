import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth/auth-context';
import { CARD_SERIES, CARD_SERIES_LIST, toCardSeries } from '@/features/game/data';
import type { CardSeries } from '@/features/game/types';
import { COLORS } from '@/features/ui/theme';

import { useOnline } from '../online-context';
import { styles } from './lobby-screen.styles';

/** Salon : créer une partie (on reçoit un code à donner) ou rejoindre celle d'un ami avec son code. */
export default function LobbyScreen() {
  const router = useRouter();
  const { player } = useAuth();
  const { room, error, createRoom, joinRoom, leaveRoom, clearError } = useOnline();

  // Série choisie avant d'arriver ici (écran « Choisis la série »).
  const { serie } = useLocalSearchParams<{ serie?: string }>();
  const [series, setSeries] = useState<CardSeries>(toCardSeries(serie));

  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  // vrai après « Créer » : dès que l'adversaire arrive, on lance la partie
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

  const opponentHasArrived = Boolean(room && room.players[0] && room.players[1]);

  useEffect(() => {
    if (isWaitingForOpponent && opponentHasArrived) {
      setIsWaitingForOpponent(false);
      router.push('/partie');
    }
  }, [isWaitingForOpponent, opponentHasArrived, router]);

  // pas connecté : le salon a besoin d'un compte
  useEffect(() => {
    if (!player) router.replace({ pathname: '/connexion', params: { next: 'en-ligne' } });
  }, [player, router]);

  async function handleCreate() {
    setLocalError(null);
    clearError();
    setIsBusy(true);
    try {
      await createRoom(series);
      setIsWaitingForOpponent(true);
    } catch (caught) {
      setLocalError(
        caught instanceof Error ? caught.message : 'Une erreur est survenue.'
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleJoin() {
    if (code.trim().length < 5) {
      setLocalError('Le code fait 5 caractères.');
      return;
    }

    setLocalError(null);
    clearError();
    setIsBusy(true);
    try {
      await joinRoom(code, series);
      router.push('/partie');
    } catch (caught) {
      setLocalError(
        caught instanceof Error ? caught.message : 'Une erreur est survenue.'
      );
    } finally {
      setIsBusy(false);
    }
  }

  function handleLeave() {
    setIsWaitingForOpponent(false);
    leaveRoom();
  }

  const shownError = localError ?? error;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.heading}>Jouer en ligne</Text>

          {room ? (
            <>
              <Text style={styles.text}>Série : {CARD_SERIES[room.series].label}</Text>
              <Text style={styles.text}>Code de la partie</Text>
              <Text style={styles.code} selectable>
                {room.code}
              </Text>

              {opponentHasArrived ? (
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => router.push('/partie')}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryText}>Reprendre la partie</Text>
                </Pressable>
              ) : (
                <>
                  <ActivityIndicator color={COLORS.yellow} />
                  <Text style={styles.text}>
                    En attente de l&apos;adversaire… Donne-lui ce code : il doit choisir «
                    Rejoindre une partie » et le taper.
                  </Text>
                </>
              )}

              <Pressable
                style={styles.secondaryButton}
                onPress={handleLeave}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryText}>Quitter cette partie</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>Série de cartes</Text>
              {CARD_SERIES_LIST.map((option) => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.secondaryButton,
                    series === option.id && styles.seriesSelected,
                  ]}
                  onPress={() => setSeries(option.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: series === option.id }}
                >
                  <Text style={styles.secondaryText}>
                    {series === option.id ? '✅ ' : ''}
                    {option.label}
                  </Text>
                </Pressable>
              ))}
              <Text style={styles.text}>
                Pour rejoindre une partie, choisis la même série que ton adversaire.
              </Text>

              <Pressable
                style={[styles.primaryButton, isBusy && styles.disabled]}
                onPress={handleCreate}
                disabled={isBusy}
                accessibilityRole="button"
              >
                {isBusy ? (
                  <ActivityIndicator color={COLORS.text} />
                ) : (
                  <Text style={styles.primaryText}>Créer une partie</Text>
                )}
              </Pressable>

              <Text style={styles.separator}>— ou —</Text>

              <Text style={styles.label}>Code d&apos;une partie existante</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={(text) => setCode(text.toUpperCase())}
                placeholder="ABCDE"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={5}
                onSubmitEditing={handleJoin}
              />
              <Pressable
                style={[styles.secondaryButton, isBusy && styles.disabled]}
                onPress={handleJoin}
                disabled={isBusy}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryText}>Rejoindre une partie</Text>
              </Pressable>
            </>
          )}

          {shownError && <Text style={styles.error}>{shownError}</Text>}

          <Pressable onPress={() => router.replace('/')} accessibilityRole="button">
            <Text style={styles.link}>← Retour à l&apos;accueil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
