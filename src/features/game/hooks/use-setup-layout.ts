import { Platform, useWindowDimensions } from 'react-native';

/** Largeur (en px) à partir de laquelle un appareil natif est considéré comme une tablette. */
const TABLET_MIN_WIDTH = 600;

/** Nombre de Pokémon affichés par ligne sur les écrans de préparation. */
const SETUP_POKEMON_PER_ROW_TABLET = 5;
const SETUP_POKEMON_PER_ROW_DEFAULT = 7;

export function useSetupLayout() {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = Platform.OS !== 'web' && screenWidth >= TABLET_MIN_WIDTH;
  const setupPokemonPerRow = isTablet
    ? SETUP_POKEMON_PER_ROW_TABLET
    : SETUP_POKEMON_PER_ROW_DEFAULT;

  return { isTablet, setupPokemonPerRow };
}
