import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
  setupPokemonRows: {
    width: '100%',
  },

  setupPokemonRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  setupPokemonCell: {
    alignItems: 'center',
    marginBottom: 20,
  },

  miniCardHeaderLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },

  miniCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  gxNameText: {
    fontSize: 12,
    fontWeight: '900',

    // GX entièrement argenté
    color: '#0a0b04',
  },

  handPokemonPressable: {
    width: 140,
    height: 200,
    marginRight: 10,
    padding: 0,
    borderRadius: 14,
    overflow: 'hidden',
  },

  screen: {
    flex: 1,
    backgroundColor: '#111111',
  },

  container: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 60,
  },

  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
  },

  handTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    marginVertical: 8,
  },

  disabledCard: {
    opacity: 0.4,
  },

  actionBox: {
    width: 300,
    backgroundColor: '#242424',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },

  actionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  actionInfo: {
    color: '#dddddd',
    marginTop: 4,
  },

  attackButton: {
    backgroundColor: '#dddddd',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 9,
    marginTop: 12,
  },

  attackButtonText: {
    color: '#111111',
    fontWeight: 'bold',
    fontSize: 16,
  },

  messageBox: {
    minHeight: 65,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  message: {
    color: '#ffd700',
    textAlign: 'center',
    fontSize: 15,
  },

  attackTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 5,
  },

  miniPokemonCard: {
    width: '100%',
    height: '100%',

    backgroundColor: '#E8E8E8',

    borderWidth: 3,
    borderColor: '#D4AF37',

    borderRadius: 14,

    overflow: 'hidden',
    alignItems: 'center',

    position: 'relative',
  },

  miniCardHeader: {
    width: '100%',
    height: 22,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 4,

    backgroundColor: '#D8D8D8',
  },

  // Symbole ✨ des Invocations, entre le niveau et les PV.
  miniCardInvocationBadge: {
    fontSize: 9,
    marginRight: 4,
  },

  miniCardStageBadge: {
    color: '#222222',
    fontSize: 6,
    fontWeight: 'bold',

    backgroundColor: '#BBBBBB',

    paddingHorizontal: 4,
    paddingVertical: 2,

    borderRadius: 4,

    marginRight: 4,
  },

  miniCardName: {
    flex: 1,

    color: '#111111',
    fontSize: 9,
    fontWeight: 'bold',
  },

  miniCardArtwork: {
    width: '90%',
    height: '34%',
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#888888',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  miniCardAttacks: {
    width: '92%',
    marginTop: 4,
    paddingHorizontal: 3,
    paddingVertical: 2,
    position: 'relative',
    overflow: 'hidden',
  },

  attackTypeWatermark: {
    position: 'absolute',
    right: 4,
    top: 2,
    fontSize: 38,
    opacity: 0.12,
  },

  miniCardTypeIcon: {
    fontSize: 22,
  },

  miniCardArtworkName: {
    color: '#333333',
    fontSize: 7,
    fontWeight: 'bold',
  },

  miniAttackName: {
    flex: 1,
    color: '#111111',
    fontSize: 6,
    fontWeight: 'bold',
  },

  miniAttackDamage: {
    color: '#111111',
    fontSize: 7,
    fontWeight: 'bold',
    marginLeft: 3,
  },

  miniCardBottom: {
    width: '92%',

    flexDirection: 'row',
    justifyContent: 'space-between',

    marginTop: 2,
  },

  miniCardEnergy: {
    flex: 1,

    color: '#111111',
    fontSize: 6,
  },

  miniCardRetreat: {
    color: '#111111',
    fontSize: 6,
    fontWeight: 'bold',
  },

  miniAttackRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },

  miniAttackEffect: {
    color: '#333333',
    fontSize: 5.5,
    lineHeight: 7,
    marginTop: 1,
    paddingHorizontal: 2,
  },

  miniAttackBlock: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#AAAAAA',
    paddingVertical: 2,
  },

  headerHpBar: {
    width: 55,
    height: 12,

    backgroundColor: '#AAAAAA',

    borderRadius: 6,
    overflow: 'hidden',

    justifyContent: 'center',

    marginLeft: 4,
  },

  headerHpBarFill: {
    height: '100%',

    backgroundColor: '#39A845',
  },

  headerHpText: {
    position: 'absolute',

    width: '100%',

    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: 'bold',

    textAlign: 'center',
  },

  miniCardArtworkImage: {
    width: '100%',
    height: '100%',
  },
});
