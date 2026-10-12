import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  playerTargetDamage: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },

  playerTargetCard: {
    backgroundColor: '#f2f2f2',

    borderWidth: 3,
    borderColor: '#d4af37',
    borderRadius: 12,

    justifyContent: 'center',
    alignItems: 'center',

    padding: 10,

    flexShrink: 0,
    flexGrow: 0,
    alignSelf: 'flex-start',
  },

  playerTargetCardSelectable: {
    borderWidth: 4,
  },

  playerTargetName: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  playerTargetHp: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },

  playerTargetStatus: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});
