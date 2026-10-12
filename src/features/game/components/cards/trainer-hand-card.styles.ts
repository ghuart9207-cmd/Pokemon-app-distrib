import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  trainerCard: {
    width: 170,
    height: 240,

    backgroundColor: '#FFF4A8',

    borderWidth: 5,
    borderColor: '#F5D84A',

    borderRadius: 15,

    padding: 5,
    marginRight: 10,

    overflow: 'hidden',
  },

  trainerTopHeader: {
    width: '100%',
    height: 22,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 7,

    backgroundColor: '#E6E7E8',

    borderWidth: 1,
    borderColor: '#A8B2B7',

    borderRadius: 7,
  },

  trainerHeaderLeft: {
    flex: 1,

    fontSize: 9,
    fontWeight: 'bold',
    fontStyle: 'italic',

    color: '#555',
  },

  trainerHeaderSeparator: {
    marginHorizontal: 6,

    fontSize: 11,
    color: '#888',
  },

  trainerHeaderRight: {
    fontSize: 9,
    fontWeight: 'bold',

    color: '#1678B8',
  },

  trainerNameBar: {
    width: '100%',
    height: 25,

    justifyContent: 'center',

    marginTop: 2,

    paddingHorizontal: 7,

    backgroundColor: '#E8E9E9',

    borderWidth: 1,
    borderColor: '#A5ADB2',

    borderRadius: 4,
  },

  trainerCardName: {
    fontSize: 13,
    fontWeight: 'bold',

    color: '#222',
  },

  trainerArtworkFrame: {
    width: '94%',
    height: 92,

    alignSelf: 'center',

    marginTop: 3,

    backgroundColor: '#DDEFF4',

    borderWidth: 2,
    borderColor: '#6CC6DC',

    overflow: 'hidden',
  },

  trainerArtworkImage: {
    width: '100%',
    height: '100%',
  },

  trainerArtworkPlaceholder: {
    fontSize: 11,
    fontWeight: 'bold',

    color: '#555',

    textAlign: 'center',
  },

  trainerToolBar: {
    width: '94%',
    height: 16,

    alignSelf: 'center',

    justifyContent: 'center',

    paddingHorizontal: 5,

    backgroundColor: '#DDF3F7',

    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,

    borderColor: '#67BDD5',
  },

  trainerToolText: {
    fontSize: 7,
    fontWeight: 'bold',
    fontStyle: 'italic',

    color: '#267C9A',
  },

  trainerDescriptionBox: {
    flex: 1,

    width: '94%',

    alignSelf: 'center',

    marginTop: 4,

    paddingHorizontal: 8,
    paddingVertical: 7,

    backgroundColor: '#F4F4F2',

    borderWidth: 1,
    borderColor: '#C8C8C5',

    borderRadius: 2,
  },

  trainerDescription: {
    fontSize: 8,
    lineHeight: 11,

    color: '#222',

    textAlign: 'left',
  },

  selectedCard: {
    borderWidth: 4,
    borderColor: '#ffd700',
  },
});
