import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  discardPreviewOverlay: {
    width: '100%',

    backgroundColor: 'rgba(255,255,255,0.97)',

    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,

    padding: 10,

    marginBottom: 12,
  },

  discardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 6,
  },

  discardPreviewTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  discardPreviewClose: {
    fontSize: 20,
    fontWeight: 'bold',

    paddingHorizontal: 6,
  },

  discardPreviewScroll: {
    width: '100%',
    height: 500,

    flexGrow: 0,
  },

  discardPreviewColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    paddingRight: 10,
  },

  discardPreviewColumn: {
    width: 180,

    flexDirection: 'column',

    gap: 10,

    marginRight: 10,
  },

  discardPreviewCard: {
    width: 180,
    height: 240,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'visible',
  },

  discardPreviewPokemonSize: {
    width: 140,
    height: 200,
  },

  discardPreviewEmpty: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
