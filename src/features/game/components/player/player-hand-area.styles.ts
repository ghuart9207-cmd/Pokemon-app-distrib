import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  handPokemonSelectionBorder: {
    borderWidth: 4,
    borderRadius: 14,
    padding: 2,
  },

  handPokemonSelected: {
    borderColor: '#22c55e',
  },

  handPokemonNotSelected: {
    borderColor: 'transparent',
  },

  playerHandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: 12,
  },

  playerHandContent: {
    flex: 1,
    minWidth: 0,
  },

  hand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 10,
  },

  handScroll: {
    width: '100%',
    maxWidth: 700,
  },

  emptyHand: {
    color: '#888888',
  },
});
