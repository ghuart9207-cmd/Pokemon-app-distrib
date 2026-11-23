import { Platform, useWindowDimensions } from 'react-native';

/** Largeur (en px) à partir de laquelle l'écran est considéré comme une tablette. */
const TABLET_MIN_WIDTH = 600;

/**
 * Sur le web (site Vercel), une tablette a une largeur entre 600 et 1200 px.
 * Au-delà, c'est un ordinateur : on garde 7 cartes par ligne.
 */
const WEB_TABLET_MAX_WIDTH = 1200;

/** Nombre de Pokémon affichés par ligne sur les écrans de préparation. */
const SETUP_POKEMON_PER_ROW_TABLET = 5;
const SETUP_POKEMON_PER_ROW_DEFAULT = 7;

export function useSetupLayout() {
  const { width: screenWidth } = useWindowDimensions();
  // Tablette : application installée (≥ 600 px), ou navigateur entre 600 et 1200 px.
  const isTablet =
    screenWidth >= TABLET_MIN_WIDTH &&
    (Platform.OS !== 'web' || screenWidth < WEB_TABLET_MAX_WIDTH);
  const setupPokemonPerRow = isTablet
    ? SETUP_POKEMON_PER_ROW_TABLET
    : SETUP_POKEMON_PER_ROW_DEFAULT;

  return { isTablet, setupPokemonPerRow };
}
