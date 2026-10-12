import { API_URL } from './config';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
};

const TIMEOUT_MS = 8000;

/** Appelle le serveur des comptes. Les erreurs ont toujours un message lisible par le joueur. */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Détail de l'erreur serveur :", data); // Ajoutez ceci pour voir l'erreur dans la console
      console.log("URL de l'API active :", API_URL);
      throw new ApiError(data?.error ?? `Erreur ${response.status}`, response.status);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'Serveur injoignable. Vérifie que le serveur est lancé (npm start dans le dossier server).',
      0
    );
  } finally {
    clearTimeout(timer);
  }
}
