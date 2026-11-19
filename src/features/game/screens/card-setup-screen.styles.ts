import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  setupPokemonSelectionBorder: {
    borderWidth: 4,
    borderRadius: 14,
    padding: 2,
  },

  setupPokemonSelected: {
    borderColor: '#22c55e',
  },

  setupPokemonNotSelected: {
    borderColor: 'transparent',
  },

  setupTrainerWrapper: {
    borderWidth: 4,
    borderColor: 'transparent',
    borderRadius: 14,
    padding: 2,
  },

  setupTrainerSelected: {
    borderColor: '#22c55e',
    borderWidth: 5,
  },

  setupGrid: {
    width: '100%',

    flexDirection: 'row',

    flexWrap: 'wrap',

    alignItems: 'flex-start',
  },

  // Panneau repliable d'une extension (Ombre Ardente, Gardiens Ascendants…)
  extensionPanel: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    backgroundColor: '#1b1b1b',
    overflow: 'hidden',
  },

  extensionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#242424',
  },

  extensionHeaderPressed: {
    backgroundColor: '#2e2e2e',
  },

  extensionChevron: {
    color: '#cccccc',
    fontSize: 14,
    width: 16,
  },

  extensionTitle: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  extensionCount: {
    color: '#aaaaaa',
    fontSize: 13,
  },

  extensionContent: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },

  extensionEmpty: {
    color: '#aaaaaa',
    fontStyle: 'italic',
    paddingVertical: 12,
    textAlign: 'center',
  },

  setupGridCell: {
    width: '14.28%',

    alignItems: 'center',

    marginBottom: 24,
  },

  // Barre « Trier par : Signe / PV / Niveau / Types »
  sortBar: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  sortLabel: {
    color: '#ffffff',
    fontWeight: '700',
    marginRight: 4,
  },

  sortOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    backgroundColor: '#1b1b1b',
  },

  sortOptionActive: {
    borderColor: '#f5c542',
    backgroundColor: '#2e2a17',
  },

  sortOptionText: {
    color: '#cccccc',
  },

  sortOptionTextActive: {
    color: '#f5c542',
    fontWeight: '700',
  },

  // En haut : titre + compteurs à gauche, cartes choisies à droite
  setupHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 8,
  },

  setupHeaderLeft: {
    width: 300,
    flexShrink: 0,
  },

  selectedArea: {
    flex: 1,
    minWidth: 260,
    marginTop: 20,
  },

  selectedScroll: {
    width: '100%',
  },

  selectedStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 10,
  },

  selectedEmpty: {
    color: '#888888',
    paddingVertical: 20,
  },
});
