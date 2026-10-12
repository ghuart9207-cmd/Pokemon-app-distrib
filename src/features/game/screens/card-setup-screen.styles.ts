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

  setupGridCell: {
    width: '14.28%',

    alignItems: 'center',

    marginBottom: 24,
  },
});
