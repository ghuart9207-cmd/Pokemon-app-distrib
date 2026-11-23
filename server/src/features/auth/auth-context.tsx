import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { ApiError, apiRequest } from './api';
import { loadToken, saveToken } from './token-storage';
import type { Player, RegisterInput } from './types';

type SessionResponse = { token: string; player: Player };

type AuthContextValue = {
  /** Joueur connecté, ou null. */
  player: Player | null;
  /** Jeton de la session en cours (utilisé par la connexion en ligne), ou null. */
  token: string | null;
  /** Vrai pendant la vérification de la connexion sauvegardée au démarrage. */
  isLoading: boolean;
  login: (pseudo: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Recharge les infos du joueur depuis la base (statistiques, ELO…). */
  refreshPlayer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au démarrage : si un jeton est sauvegardé, on demande au serveur à qui il appartient.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const savedToken = await loadToken();

      if (!savedToken) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const { player: restored } = await apiRequest<{ player: Player }>('/me', {
          token: savedToken,
        });
        if (!cancelled) {
          setPlayer(restored);
          setToken(savedToken);
        }
      } catch (error) {
        // Jeton refusé : on l'oublie. Serveur injoignable : on le garde pour plus tard.
        if (error instanceof ApiError && error.status === 401) await saveToken(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function startSession(response: SessionResponse) {
    await saveToken(response.token);
    setToken(response.token);
    setPlayer(response.player);
  }

  async function login(pseudo: string, password: string) {
    const response = await apiRequest<SessionResponse>('/login', {
      method: 'POST',
      body: { pseudo, password },
    });
    await startSession(response);
  }

  async function register(input: RegisterInput) {
    const response = await apiRequest<SessionResponse>('/register', {
      method: 'POST',
      body: input,
    });
    await startSession(response);
  }

  async function logout() {
    try {
      await apiRequest('/logout', { method: 'POST', token });
    } catch {
      // même si le serveur est injoignable, on se déconnecte localement
    }

    await saveToken(null);
    setToken(null);
    setPlayer(null);
  }

  async function refreshPlayer() {
    if (!token) return;

    try {
      const { player: fresh } = await apiRequest<{ player: Player }>('/me', { token });
      setPlayer(fresh);
    } catch {
      // pas grave : les infos seront rechargées au prochain démarrage
    }
  }

  return (
    <AuthContext.Provider
      value={{ player, token, isLoading, login, register, logout, refreshPlayer }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un <AuthProvider>.');
  }

  return context;
}
