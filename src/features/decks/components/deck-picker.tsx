import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import type { CardSeries } from '@/features/game/types';
import { COLORS, FONTS } from '@/features/ui/theme';

import type { SavedDeck } from '../deck-storage';
import { useDecks } from '../use-decks';

type DeckPickerProps = {
  series: CardSeries;
  /** Jouer avec le deck choisi. */
  onUseDeck: (deck: SavedDeck) => void;
};

/**
 * Bouton « Decks » de l'écran de choix des cartes : liste les decks de la série,
 * puis propose de modifier le deck ou de jouer avec.
 */
export function DeckPicker({ series, onUseDeck }: DeckPickerProps) {
  const router = useRouter();
  const { decks, isLoggedIn } = useDecks();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isLoggedIn) return null;

  // Seulement les decks de la série de la partie.
  const seriesDecks = decks.filter((deck) => deck.series === series);

  function close() {
    setOpen(false);
    setSelectedId(null);
  }

  return (
    <>
      <Pressable style={styles.openButton} onPress={() => setOpen(true)} accessibilityRole="button">
        <Text style={styles.openButtonText}>📚 Decks</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.panel}>
            <Text style={styles.title}>Mes decks</Text>

            {seriesDecks.length === 0 ? (
              <Text style={styles.muted}>
                Aucun deck pour cette série. Crée-en un depuis le menu, bouton « Decks ».
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ gap: 10 }}>
                {seriesDecks.map((deck) => (
                  <View key={deck.id}>
                    <Pressable
                      style={[styles.deckRow, selectedId === deck.id && styles.deckRowSelected]}
                      onPress={() => setSelectedId(selectedId === deck.id ? null : deck.id)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.deckName}>{deck.name}</Text>
                      <Text style={styles.muted}>{deck.cardIds.length} cartes</Text>
                    </Pressable>

                    {selectedId === deck.id && (
                      <View style={styles.choiceRow}>
                        <Pressable
                          style={[styles.choiceButton, styles.editButton]}
                          onPress={() => {
                            close();
                            router.push({
                              pathname: '/deck-editor',
                              params: { serie: deck.series, deckId: deck.id },
                            });
                          }}
                        >
                          <Text style={styles.choiceText}>✏️ Modifier</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.choiceButton, styles.useButton]}
                          onPress={() => {
                            close();
                            onUseDeck(deck);
                          }}
                        >
                          <Text style={styles.choiceText}>✅ Jouer avec</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            <Pressable onPress={close} accessibilityRole="button">
              <Text style={styles.link}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = {
  openButton: {
    alignSelf: 'flex-end' as const,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.yellow,
  },
  openButtonText: {
    color: COLORS.yellow,
    fontFamily: FONTS.button,
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 16,
  },
  panel: {
    width: '100%' as const,
    maxWidth: 440,
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 14,
  },
  title: {
    color: COLORS.yellow,
    fontFamily: FONTS.title,
    fontSize: 32,
    textAlign: 'center' as const,
  },
  deckRow: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  deckRowSelected: {
    borderColor: COLORS.yellow,
  },
  deckName: {
    color: COLORS.text,
    fontFamily: FONTS.button,
    fontSize: 18,
  },
  muted: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  choiceRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginTop: 8,
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center' as const,
  },
  editButton: {
    backgroundColor: '#444C70',
  },
  useButton: {
    backgroundColor: COLORS.red,
  },
  choiceText: {
    color: COLORS.text,
    fontFamily: FONTS.button,
    fontSize: 15,
  },
  link: {
    color: COLORS.yellow,
    textAlign: 'center' as const,
    textDecorationLine: 'underline' as const,
    fontSize: 16,
  },
};
