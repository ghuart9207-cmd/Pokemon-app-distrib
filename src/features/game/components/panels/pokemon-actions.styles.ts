import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  retreatButton: {
    backgroundColor: '#555555',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 9,
    marginTop: 8,
  },

  retreatButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  attackChoice: {
    width: '100%',
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },

  attackEffectText: {
    color: '#bbbbbb',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },

  selectedAttackChoice: {
    borderColor: '#ffd700',
    borderWidth: 3,
  },

  attackChoiceName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  attackChoiceInfo: {
    color: '#cccccc',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 3,
  },
});
