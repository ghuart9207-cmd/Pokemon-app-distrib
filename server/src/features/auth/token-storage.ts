import { Platform } from 'react-native';

const STORAGE_KEY = 'pokemon-version-vincent-token';

// Sur mobile, le jeton n'est gardé qu'en mémoire (il faut se reconnecter à chaque lancement).
let memoryToken: string | null = null;

/** Relit le jeton de connexion sauvegardé (navigateur : localStorage). */
export async function loadToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  return memoryToken;
}

/** Sauvegarde le jeton de connexion, ou l'efface si `token` vaut null. */
export async function saveToken(token: string | null): Promise<void> {
  memoryToken = token;

  if (Platform.OS === 'web') {
    try {
      if (token) window.localStorage.setItem(STORAGE_KEY, token);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // stockage indisponible (navigation privée, rendu serveur…) : on continue sans
    }
  }
}
