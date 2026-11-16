import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import { TrainerHandCard } from '@/features/game/components/cards/trainer-hand-card';
import type { CardSeriesInfo } from '@/features/game/data';
import type { GameCard, Player, PokemonCard, SetupPhase, TrainerCard } from '@/features/game/types';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import { styles } from './card-setup-screen.styles';
import { MAX_GX_EX_IN_SETUP } from '@/features/game/hooks/use-game-setup';

type SetupCounts = {
  pokemonCount: number;
  gxExCount: number;
  objectCount: number;
  supporterCount: number;
};

type CardSetupScreenProps = {
  cardSeries: CardSeriesInfo;
  setupPhase: SetupPhase;
  player1SetupCards: GameCard[];
  player2SetupCards: GameCard[];
  setupPokemonPerRow: number;
  isTablet: boolean;
  message: string;
  getSetupCounts: (cards: GameCard[]) => SetupCounts;
  onToggleCard: (card: GameCard) => void;
  onConfirm: () => void;
  /** Élément affiché en haut à droite (ex : bouton « Decks »). */
  headerRight?: ReactNode;
  /** Titre à la place de « Composition de la main du joueur X » (ex : création de deck). */
  titleOverride?: string;
};

// Identifiant du panneau Dresseurs (pour le replier comme les autres).
const TRAINERS_PANEL_ID = '__dresseurs__';

export function CardSetupScreen({
  cardSeries,
  setupPhase,
  player1SetupCards,
  player2SetupCards,
  setupPokemonPerRow,
  isTablet,
  message,
  getSetupCounts,
  onToggleCard,
  onConfirm,
  headerRight,
  titleOverride,
}: CardSetupScreenProps) {
  const setupPlayer: Player = setupPhase === 'player1' ? 1 : 2;
  const setupCards = setupPhase === 'player1' ? player1SetupCards : player2SetupCards;
  const { pokemonCount, gxExCount, objectCount, supporterCount } =
    getSetupCounts(setupCards);

  // Panneaux repliés (id de l'extension -> true si replié).
  const [collapsedExtensions, setCollapsedExtensions] = useState<Record<string, boolean>>(
    {}
  );

  function toggleExtension(extensionId: string) {
    setCollapsedExtensions((previous) => ({
      ...previous,
      [extensionId]: !previous[extensionId],
    }));
  }

  const isSelected = (card: GameCard) =>
    setupCards.some((selectedCard) => selectedCard.id === card.id);

  const objects = cardSeries.trainers.filter((card) => card.category === 'objet');
  const supporters = cardSeries.trainers.filter((card) => card.category === 'supporter');

  return (
    <ScrollView
      style={sharedStyles.screen}
      contentContainerStyle={sharedStyles.container}
    >
      {headerRight && <View style={{ alignSelf: 'stretch', alignItems: 'flex-end' }}>{headerRight}</View>}

      <Text style={sharedStyles.title}>Pokémon Plateau</Text>

      <View style={sharedStyles.actionBox}>
        <Text style={sharedStyles.actionTitle}>
          {titleOverride ?? `Composition de la main du joueur ${setupPlayer}`}
        </Text>
        <Text style={sharedStyles.actionInfo}>Série : {cardSeries.label}</Text>
        {cardSeries.pokemon.length === 0 && (
          <Text style={sharedStyles.actionInfo}>
            Aucune carte n&apos;est encore disponible dans cette série.
          </Text>
        )}
        <Text style={sharedStyles.actionInfo}>Pokémon : {pokemonCount}/8</Text>
        <Text style={sharedStyles.actionInfo}>
          dont GX / EX : {gxExCount}/{MAX_GX_EX_IN_SETUP} maximum
        </Text>
        <Text style={sharedStyles.actionInfo}>Objets : {objectCount}/3</Text>
        <Text style={sharedStyles.actionInfo}>Supporters : {supporterCount}/2</Text>
      </View>

      {/* Un panneau par extension : uniquement ses Pokémon */}
      {cardSeries.extensions.map((extension) => (
        <CollapsiblePanel
          key={extension.id}
          title={extension.label}
          cards={extension.pokemon}
          collapsed={collapsedExtensions[extension.id] === true}
          onToggleCollapsed={() => toggleExtension(extension.id)}
          isSelected={isSelected}
        >
          <PokemonGrid
            cards={extension.pokemon}
            isSelected={isSelected}
            setupPokemonPerRow={setupPokemonPerRow}
            onToggleCard={onToggleCard}
          />
        </CollapsiblePanel>
      ))}

      {/* Panneau à part : tous les Dresseurs de la série */}
      <CollapsiblePanel
        title="Dresseurs"
        cards={cardSeries.trainers}
        collapsed={collapsedExtensions[TRAINERS_PANEL_ID] === true}
        onToggleCollapsed={() => toggleExtension(TRAINERS_PANEL_ID)}
        isSelected={isSelected}
      >
        {objects.length > 0 && (
          <>
            <Text style={sharedStyles.handTitle}>Objets ({objectCount}/3)</Text>
            <TrainerGrid
              cards={objects}
              isSelected={isSelected}
              isTablet={isTablet}
              onToggleCard={onToggleCard}
            />
          </>
        )}

        {supporters.length > 0 && (
          <>
            <Text style={sharedStyles.handTitle}>
              Supporters ({supporterCount}/2)
            </Text>
            <TrainerGrid
              cards={supporters}
              isSelected={isSelected}
              isTablet={isTablet}
              onToggleCard={onToggleCard}
            />
          </>
        )}
      </CollapsiblePanel>

      <Pressable onPress={onConfirm} style={sharedStyles.attackButton}>
        <Text style={sharedStyles.attackButtonText}>
          {setupPhase === 'player1'
            ? 'VALIDER LA MAIN DU JOUEUR 1'
            : 'VALIDER ET COMMENCER LA PARTIE'}
        </Text>
      </Pressable>

      <View style={sharedStyles.messageBox}>
        <Text style={sharedStyles.message}>{message}</Text>
      </View>
    </ScrollView>
  );
}

type CollapsiblePanelProps = {
  title: string;
  /** Cartes du panneau (pour les compteurs du titre). */
  cards: GameCard[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  isSelected: (card: GameCard) => boolean;
  children: ReactNode;
};

/** Panneau repliable (extension comme Ombre Ardente, ou Dresseurs). */
function CollapsiblePanel({
  title,
  cards,
  collapsed,
  onToggleCollapsed,
  isSelected,
  children,
}: CollapsiblePanelProps) {
  const selectedCount = cards.filter(isSelected).length;

  return (
    <View style={styles.extensionPanel}>
      <Pressable
        onPress={onToggleCollapsed}
        style={({ pressed }) => [
          styles.extensionHeader,
          pressed && styles.extensionHeaderPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded: !collapsed }}
      >
        <Text style={styles.extensionChevron}>{collapsed ? '▶' : '▼'}</Text>
        <Text style={styles.extensionTitle}>{title}</Text>
        <Text style={styles.extensionCount}>
          {selectedCount > 0 ? `${selectedCount} choisie(s) · ` : ''}
          {cards.length} carte(s)
        </Text>
      </Pressable>

      {!collapsed && (
        <View style={styles.extensionContent}>
          {cards.length === 0 ? (
            <Text style={styles.extensionEmpty}>
              Aucune carte pour l&apos;instant.
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
}

function PokemonGrid({
  cards,
  isSelected,
  setupPokemonPerRow,
  onToggleCard,
}: {
  cards: PokemonCard[];
  isSelected: (card: GameCard) => boolean;
  setupPokemonPerRow: number;
  onToggleCard: (card: GameCard) => void;
}) {
  return (
    <View style={sharedStyles.setupPokemonRows}>
      {Array.from({
        length: Math.ceil(cards.length / setupPokemonPerRow),
      }).map((_, rowIndex) => {
        const rowCards = cards.slice(
          rowIndex * setupPokemonPerRow,
          rowIndex * setupPokemonPerRow + setupPokemonPerRow
        );

        return (
          <View key={`pokemon-row-${rowIndex}`} style={sharedStyles.setupPokemonRow}>
            {rowCards.map((card) => {
              const selected = isSelected(card);

              return (
                <View
                  key={card.id}
                  style={[
                    sharedStyles.setupPokemonCell,
                    { width: `${100 / setupPokemonPerRow}%` as `${number}%` },
                  ]}
                >
                  <View
                    style={[
                      styles.setupPokemonSelectionBorder,
                      selected
                        ? styles.setupPokemonSelected
                        : styles.setupPokemonNotSelected,
                    ]}
                  >
                    <Pressable
                      onPress={() => onToggleCard(card)}
                      style={sharedStyles.handPokemonPressable}
                    >
                      <PokemonHandCard card={card} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

function TrainerGrid({
  cards,
  isSelected,
  isTablet,
  onToggleCard,
}: {
  cards: TrainerCard[];
  isSelected: (card: GameCard) => boolean;
  isTablet: boolean;
  onToggleCard: (card: GameCard) => void;
}) {
  return (
    <View style={styles.setupGrid}>
      {cards.map((card) => {
        const selected = isSelected(card);

        return (
          <View
            key={card.id}
            style={[
              styles.setupGridCell,
              isTablet && { width: '20%', paddingHorizontal: 6 },
            ]}
          >
            <View
              style={[
                styles.setupTrainerWrapper,
                selected && styles.setupTrainerSelected,
              ]}
            >
              <TrainerHandCard
                card={card}
                disabled={false}
                isSelected={selected}
                onPress={() => onToggleCard(card)}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
