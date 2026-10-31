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
});
