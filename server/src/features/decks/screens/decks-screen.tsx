import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CARD_SERIES_LIST } from '@/features/game/data';
import { COLORS, FONTS } from '@/features/ui/theme';

import { useDecks } from '../use-decks';

/** Menu « Decks » : la liste des decks, pour en ajouter, renommer, modifier ou supprimer. */
export default function DecksScreen() {
  const router = useRouter();
  const { decks, isLoggedIn, renameDeck, deleteDeck } = useDecks();

  // Deck en cours de renommage, et le texte tapé.
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  // Deck dont on demande la confirmation de suppression.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const seriesLabel = (id: string) =>
    CARD_SERIES_LIST.find((series) => series.id === id)?.label ?? id;

  function startRename(deckId: string, currentName: string) {
    setRenamingId(deckId);
    setRenameText(currentName);
    setDeletingId(null);
  }

  function confirmRename() {
    if (renamingId) renameDeck(renamingId, renameText);
    setRenamingId(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading} accessibilityRole="header">
          Mes decks
        </Text>

        {!isLoggedIn ? (
          <Text style={styles.text}>Connecte-toi pour créer et utiliser des decks.</Text>
        ) : (
          <>
            <Pressable
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              onPress={() => router.push({ pathname: '/serie', params: { mode: 'deck' } })}
              accessibilityRole="button"
            >
              <Text style={styles.addText}>➕ Ajouter un deck</Text>
            </Pressable>

            {decks.length === 0 && (
              <Text style={styles.text}>Tu n'as encore aucun deck.</Text>
            )}

            {decks.map((deck) => (
              <View key={deck.id} style={styles.deckCard}>
                {renamingId === deck.id ? (
                  <View style={styles.row}>
                    <TextInput
                      value={renameText}
                      onChangeText={setRenameText}
                      onSubmitEditing={confirmRename}
                      autoFocus
                      maxLength={30}
                      style={styles.input}
                    />
                    <Pressable style={styles.smallButton} onPress={confirmRename}>
                      <Text style={styles.smallText}>OK</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/deck-editor',
                        params: { serie: deck.series, deckId: deck.id },
                      })
                    }
                    accessibilityRole="button"
                  >
                    <Text style={styles.deckName}>{deck.name}</Text>
                    <Text style={styles.muted}>
                      {seriesLabel(deck.series)} · {deck.cardIds.length} cartes · appuie pour modifier
                    </Text>
                  </Pressable>
                )}

                {renamingId !== deck.id && (
                  <View style={styles.row}>
                    <Pressable
                      style={styles.smallButton}
                      onPress={() => startRename(deck.id, deck.name)}
                    >
                      <Text style={styles.smallText}>✏️ Renommer</Text>
                    </Pressable>

                    {deletingId === deck.id ? (
                      <>
                        <Pressable
                          style={[styles.smallButton, styles.dangerButton]}
                          onPress={() => {
                            deleteDeck(deck.id);
                            setDeletingId(null);
                          }}
                        >
                          <Text style={styles.smallText}>Oui, supprimer</Text>
                        </Pressable>
                        <Pressable style={styles.smallButton} onPress={() => setDeletingId(null)}>
                          <Text style={styles.smallText}>Non</Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        style={styles.smallButton}
                        onPress={() => {
                          setDeletingId(deck.id);
                          setRenamingId(null);
                        }}
                      >
                        <Text style={styles.smallText}>🗑️ Supprimer</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.link}>← Retour</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
  heading: {
    fontFamily: FONTS.title,
    fontSize: 48,
    color: COLORS.yellow,
    letterSpacing: 2,
    textAlign: 'center' as const,
    textShadowColor: COLORS.border,
    textShadowOffset: { width: 3, height: 4 },
    textShadowRadius: 0,
  },
  text: {
    fontFamily: FONTS.body,
    fontSize: 17,
    color: COLORS.text,
    textAlign: 'center' as const,
  },
  addButton: {
    minWidth: 280,
    alignItems: 'center' as const,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: COLORS.red,
    borderBottomWidth: 5,
    borderBottomColor: COLORS.redDark,
  },
  pressed: {
    opacity: 0.9,
  },
  addText: {
    fontFamily: FONTS.button,
    fontSize: 20,
    color: COLORS.text,
  },
  deckCard: {
    width: '100%' as const,
    maxWidth: 480,
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 10,
  },
  deckName: {
    fontFamily: FONTS.button,
    fontSize: 20,
    color: COLORS.yellow,
  },
  muted: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  row: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    alignItems: 'center' as const,
  },
  input: {
    flex: 1,
    minWidth: 160,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.yellow,
    color: COLORS.text,
    fontSize: 17,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#444C70',
  },
  dangerButton: {
    backgroundColor: COLORS.redDark,
  },
  smallText: {
    color: COLORS.text,
    fontFamily: FONTS.button,
    fontSize: 14,
  },
  link: {
    color: COLORS.yellow,
    textDecorationLine: 'underline' as const,
    fontSize: 16,
    marginTop: 8,
  },
};
