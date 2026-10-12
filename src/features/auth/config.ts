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
  Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultUrl;

/** Adresse du serveur temps réel (WebSocket) : la même que l'API, en ws:// ou wss://. */
export const WS_URL = `${API_URL.replace(/^http/, 'ws')}/ws`;
