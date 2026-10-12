import { Platform } from 'react-native';

/**
 * Adresse du serveur des comptes (dossier `server/`).
 *
 * - navigateur / simulateur iOS : http://localhost:3001
 * - émulateur Android           : http://10.0.2.2:3001
 * - vrai téléphone              : l'adresse IP de ton PC, par ex. http://192.168.1.20:3001
 *   (à définir avec la variable EXPO_PUBLIC_API_URL, par ex. dans un fichier .env à la racine)
 */
const defaultUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'https://pokemon-app-distrib.onrender.comhttps://pokemon-app-distrib.onrender.com';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultUrl;
