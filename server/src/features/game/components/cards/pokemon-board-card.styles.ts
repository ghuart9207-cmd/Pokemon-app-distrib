import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  attachedToolThumbnail: {
    position: 'absolute',

    left: 3,
    top: 48,

    width: 28,
    height: 44,

    zIndex: 30,

    backgroundColor: '#E8F4F8',

    borderWidth: 2,
    borderColor: '#62B9D2',

    borderRadius: 4,

    overflow: 'hidden',
  },

  attachedToolThumbnailImage: {
    width: '100%',
    height: '100%',
  },

  attachedToolThumbnailFallback: {
    flex: 1,

    textAlign: 'center',
    textAlignVertical: 'center',

    fontSize: 15,
  },

  miniCardStatuses: {
    fontSize: 8,
    marginTop: 2,
  },

  miniCardAttacked: {
    color: '#B00000',
    fontSize: 6,
    fontWeight: 'bold',
    marginTop: 1,
  },
});
