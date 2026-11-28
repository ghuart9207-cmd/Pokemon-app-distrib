import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { PokemonHandCard } from '@/features/game/components/cards/pokemon-hand-card';
import { TrainerHandCard } from '@/features/game/components/cards/trainer-hand-card';
import type { CardSeriesInfo } from '@/features/game/data';
import { isPokemonCard } from '@/features/game/rules';
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
// Identifiant du panneau unique quand les Pokémon sont triés (PV, niveau, types).
const SORTED_PANEL_ID = '__tri__';

/** Façon de trier les Pokémon. 'signe' : un panneau par extension (comme avant). */
type SortMode = 'signe' | 'pv' | 'niveau' | 'types';

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'signe', label: 'Signe' },
  { mode: 'pv', label: 'PV' },
  { mode: 'niveau', label: 'Niveau' },
  { mode: 'types', label: 'Types' },
];

const SORT_TITLES: Record<Exclude<SortMode, 'signe'>, string> = {
  pv: 'Pokémon triés par PV',
  niveau: 'Pokémon triés par niveau',
  types: 'Pokémon triés par type',
};

/** Ordre des types, comme dans les vraies extensions Pokémon. */
const TYPE_ORDER: PokemonCard['type'][] = [
  'plante',
  'feu',
  'eau',
  'electrique',
  'psy',
  'combat',
  'obscurite',
  'metal',
  'fee',
  'dragon',
  'normal',
];

function typeRank(card: PokemonCard): number {
  const index = TYPE_ORDER.indexOf(card.type);
  return index === -1 ? TYPE_ORDER.length : index;
}

/** Niveau : Méga-EX, puis GX / EX, puis Niveau 2, Niveau 1 et Base. */
function levelRank(card: PokemonCard): number {
  if (card.stage === 'mega_ex') return 5;
  if (card.variant === 'gx' || card.variant === 'ex') return 4;
  if (card.stage === 'niveau2') return 3;
  if (card.stage === 'niveau1') return 2;
  return 1;
}

/**
 * Tous les Pokémon de la série triés : d'abord le critère choisi,
 * puis le type (Plante en premier…), puis l'ordre des signes (extensions).
 */
function sortSeriesPokemon(cardSeries: CardSeriesInfo, mode: Exclude<SortMode, 'signe'>): PokemonCard[] {
  const entries = cardSeries.extensions.flatMap((extension, extensionIndex) =>
    extension.pokemon.map((card, cardIndex) => ({ card, extensionIndex, cardIndex }))
  );

  return entries
    .sort((a, b) => {
      if (mode === 'pv' && a.card.maxHp !== b.card.maxHp) return b.card.maxHp - a.card.maxHp;
      if (mode === 'niveau' && levelRank(a.card) !== levelRank(b.card)) {
        return levelRank(b.card) - levelRank(a.card);
      }
      if (typeRank(a.card) !== typeRank(b.card)) return typeRank(a.card) - typeRank(b.card);
      if (a.extensionIndex !== b.extensionIndex) return a.extensionIndex - b.extensionIndex;
      return a.cardIndex - b.cardIndex;
    })
    .map(({ card }) => card);
}

export function CardSetupScreen({
  cardSeries: rawCardSeries,
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
  // Une carte « vide » (undefined) dans une liste vient presque toujours d'un mauvais nom
  // dans un index.ts / all-cards.ts : on l'ignore pour ne pas planter, et on le signale.
  const brokenLists: string[] = [];
  const clean = <T,>(list: (T | undefined | null)[], label: string): T[] => {
    const ok = list.filter((card): card is T => card !== undefined && card !== null);
    if (ok.length !== list.length) brokenLists.push(label);
    return ok;
  };
  const cardSeries: CardSeriesInfo = {
    ...rawCardSeries,
    pokemon: clean(rawCardSeries.pokemon, 'Pokémon de la série'),
    trainers: clean(rawCardSeries.trainers, 'Dresseurs de la série'),
    extensions: rawCardSeries.extensions.map((extension) => ({
      ...extension,
      pokemon: clean(extension.pokemon, `Pokémon de ${extension.label}`),
      trainers: clean(extension.trainers, `Dresseurs de ${extension.label}`),
    })),
  };

  const setupPlayer: Player = setupPhase === 'player1' ? 1 : 2;
  const setupCards = (setupPhase === 'player1' ? player1SetupCards : player2SetupCards).filter(
    (card): card is GameCard => card !== undefined && card !== null
  );
  const { pokemonCount, gxExCount, objectCount, supporterCount } =
    getSetupCounts(setupCards);

  // Panneaux repliés (id de l'extension -> true si replié).
  const [collapsedExtensions, setCollapsedExtensions] = useState<Record<string, boolean>>(
    {}
  );

  // Tri des Pokémon (par signe = comme avant).
  const [sortMode, setSortMode] = useState<SortMode>('signe');
  const sortedPokemon =
    sortMode === 'signe' ? [] : sortSeriesPokemon(cardSeries, sortMode as Exclude<SortMode, 'signe'>);

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

      {/* En haut : le titre et les compteurs à gauche, les cartes choisies à droite */}
      <View style={styles.setupHeaderRow}>
      <View style={styles.setupHeaderLeft}>
      <Text style={sharedStyles.title}>Pokémon Plateau</Text>

      <View style={sharedStyles.actionBox}>
        <Text style={sharedStyles.actionTitle}>
          {titleOverride ?? `Composition de la main du joueur ${setupPlayer}`}
        </Text>
        <Text style={sharedStyles.actionInfo}>Série : {cardSeries.label}</Text>
        {brokenLists.length > 0 && (
          <Text style={[sharedStyles.actionInfo, { color: '#ff6b6b' }]}>
            ⚠️ Carte introuvable (mauvais nom dans un index.ts ou all-cards.ts) dans : {[...new Set(brokenLists)].join(', ')}.
          </Text>
        )}
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
      </View>

      <SelectedCardsStrip cards={setupCards} onToggleCard={onToggleCard} />
      </View>

      {/* Tri des Pokémon */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Trier par :</Text>
        {SORT_OPTIONS.map((option) => {
          const active = sortMode === option.mode;
          return (
            <Pressable
              key={option.mode}
              onPress={() => setSortMode(option.mode)}
              style={[styles.sortOption, active && styles.sortOptionActive]}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
            >
              <Text style={[styles.sortOptionText, active && styles.sortOptionTextActive]}>
                {active ? '◉' : '○'} {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Trié par PV / niveau / types : un seul panneau avec tous les Pokémon */}
      {sortMode !== 'signe' && (
        <CollapsiblePanel
          title={SORT_TITLES[sortMode as Exclude<SortMode, 'signe'>]}
          cards={sortedPokemon}
          collapsed={collapsedExtensions[SORTED_PANEL_ID] === true}
          onToggleCollapsed={() => toggleExtension(SORTED_PANEL_ID)}
          isSelected={isSelected}
        >
          <PokemonGrid
            cards={sortedPokemon}
            isSelected={isSelected}
            setupPokemonPerRow={setupPokemonPerRow}
            onToggleCard={onToggleCard}
          />
        </CollapsiblePanel>
      )}

      {/* Par signe : un panneau par extension, uniquement ses Pokémon */}
      {sortMode === 'signe' && cardSeries.extensions.map((extension) => (
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

/** Cartes déjà choisies, qui défilent comme la main (un clic les retire). */
function SelectedCardsStrip({
  cards,
  onToggleCard,
}: {
  cards: GameCard[];
  onToggleCard: (card: GameCard) => void;
}) {
  return (
    <View style={styles.selectedArea}>
      <Text style={sharedStyles.handTitle}>Cartes choisies ({cards.length})</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={styles.selectedStrip}
        style={styles.selectedScroll}
      >
        {cards.length > 0 ? (
          cards.map((card, index) =>
            isPokemonCard(card) ? (
              <Pressable
                key={`choisie-${card.id}-${index}`}
                onPress={() => onToggleCard(card)}
                style={sharedStyles.handPokemonPressable}
              >
                <PokemonHandCard card={card} />
              </Pressable>
            ) : (
              <View key={`choisie-${card.id}-${index}`}>
                <TrainerHandCard
                  card={card}
                  disabled={false}
                  isSelected={false}
                  onPress={() => onToggleCard(card)}
                />
              </View>
            )
          )
        ) : (
          <Text style={styles.selectedEmpty}>Clique sur des cartes plus bas pour les ajouter.</Text>
        )}
      </ScrollView>
    </View>
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
