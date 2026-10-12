import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  boardBackground: {
    width: 900,
    height: 946,
    position: 'relative',
    overflow: 'hidden',
  },

  boardImageCell: {
    position: 'absolute',

    width: '15.5%',
    height: '21.2%',

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    padding: 0,
  },

  selectedImageCell: {
    borderWidth: 4,
    borderColor: '#FFD700',
  },

  imageCellLabel: {
    position: 'absolute',
    top: 4,
    left: 4,

    zIndex: 10,

    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',

    backgroundColor: 'rgba(0, 0, 0, 0.75)',

    paddingHorizontal: 4,
    paddingVertical: 2,

    borderRadius: 4,
  },
});
