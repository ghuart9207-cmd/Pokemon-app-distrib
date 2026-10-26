import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/features/ui/theme';

import { useAuth } from '../auth-context';
import { getAvatarChoices } from '../avatars';
import { PlayerAvatar } from '../components/player-avatar';
import { styles } from './login-screen.styles';

type Mode = 'login' | 'register';

const PSEUDO_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;
const MIN_PASSWORD_LENGTH = 8;

/** Écran de connexion / création de compte. */
export default function LoginScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === 'register';
  const avatarChoices = getAvatarChoices();

  function changeMode(newMode: Mode) {
    setMode(newMode);
    setError(null);
  }

  /** Message à afficher si le formulaire est incomplet, sinon null. */
  function validateForm(): string | null {
    if (!pseudo.trim()) return 'Entre ton pseudo.';
    if (!password) return 'Entre ton mot de passe.';

    if (isRegister) {
      if (!PSEUDO_PATTERN.test(pseudo.trim())) {
        return 'Le pseudo doit faire 3 à 20 caractères (lettres, chiffres, _ ou -).';
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return `Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`;
      }
    }

    return null;
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register({
          pseudo: pseudo.trim(),
          password,
          email: email.trim() || undefined,
          avatar: avatar ?? undefined,
        });
      } else {
        await login(pseudo.trim(), password);
      }

      // connecté : on va là où le joueur voulait aller (jeu local, salon en ligne), sinon à l'accueil
      if (next === 'serie-local' || next === 'serie-en-ligne') {
        router.replace({
          pathname: '/serie',
          params: { mode: next === 'serie-en-ligne' ? 'en-ligne' : 'local' },
        });
      } else {
        router.replace(next === 'jeu' ? '/jeu' : next === 'en-ligne' ? '/en-ligne' : '/');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.heading}>
            {isRegister ? 'Créer un compte' : 'Connexion'}
          </Text>

          <View style={styles.tabs}>
            {(['login', 'register'] as const).map((tabMode) => (
              <Pressable
                key={tabMode}
                style={[styles.tab, mode === tabMode && styles.tabActive]}
                onPress={() => changeMode(tabMode)}
                accessibilityRole="button"
              >
                <Text style={[styles.tabText, mode === tabMode && styles.tabTextActive]}>
                  {tabMode === 'login' ? 'Se connecter' : 'Nouveau compte'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Pseudo</Text>
          <TextInput
            style={styles.input}
            value={pseudo}
            onChangeText={setPseudo}
            placeholder="Sacha"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={isRegister ? '8 caractères minimum' : 'Mot de passe'}
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={72}
            onSubmitEditing={handleSubmit}
          />

          {isRegister && (
            <>
              <Text style={styles.label}>Email (facultatif)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="sacha@exemple.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Image de profil</Text>
              <ScrollView horizontal contentContainerStyle={styles.avatarList}>
                {avatarChoices.map((choice) => (
                  <Pressable
                    key={choice.key}
                    style={[
                      styles.avatarOption,
                      avatar === choice.key && styles.avatarOptionSelected,
                    ]}
                    onPress={() => setAvatar(choice.key)}
                    accessibilityLabel={choice.name}
                  >
                    <PlayerAvatar avatarUrl={choice.key} width={54} />
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.submitText}>
                {isRegister ? 'Créer mon compte' : 'Se connecter'}
              </Text>
            )}
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable onPress={() => router.replace('/jeu')} accessibilityRole="button">
              <Text style={styles.link}>Continuer sans compte</Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/')} accessibilityRole="button">
              <Text style={styles.link}>← Retour à l'accueil</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
