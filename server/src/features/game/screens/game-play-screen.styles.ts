import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  round: {
    color: '#cccccc',
    fontSize: 18,
    marginTop: 5,
  },

  turnBox: {
    marginVertical: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#292929',
    borderRadius: 10,
  },

  turnText: {
    color: '#ffd700',
    fontSize: 20,
    fontWeight: 'bold',
  },

  info: {
    color: '#cccccc',
    marginVertical: 5,
  },

  endTurnButton: {
    marginTop: 10,
    backgroundColor: '#dddddd',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 10,
  },

  endTurnText: {
    color: '#111111',
    fontSize: 17,
    fontWeight: 'bold',
  },

  restartButton: {
    marginTop: 15,
    backgroundColor: '#444444',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },

  restartButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },

  battleAreaScroll: {
    width: '100%',
    marginVertical: 20,
  },

  battleAreaScrollContent: {
    paddingHorizontal: 10,
  },

  battleAreaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  rightBattlePanel: {
    width: 330,
    minHeight: 946,

    marginLeft: 18,

    padding: 12,

    backgroundColor: 'rgba(20, 20, 20, 0.92)',

    borderRadius: 12,
  },

  boardWrapper: {
    position: 'relative',
    width: 900,
    height: 946,
    alignItems: 'flex-start',
  },
});
