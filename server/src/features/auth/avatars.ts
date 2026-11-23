import { ALL_POKEMON_CARDS } from '@/features/game/data';

/** Une image de profil = l'illustration d'une carte Pokémon du jeu. */
const AVATAR_PREFIX = 'card:';

export type AvatarChoice = {
  /** Valeur enregistrée en base (colonne avatar_url), par ex. `card:pikachu-001`. */
  key: string;
  name: string;
  source: unknown;
};

/** Toutes les images proposées : les nouveaux Pokémon ajoutés au jeu apparaissent automatiquement. */
export function getAvatarChoices(): AvatarChoice[] {
  return ALL_POKEMON_CARDS.filter((card) => card.artwork).map((card) => ({
    key: `${AVATAR_PREFIX}${card.id}`,
    name: card.name,
    source: card.artwork,
  }));
}

/** Image correspondant à la valeur enregistrée en base, ou null si elle est inconnue. */
export function getAvatarSource(avatarUrl: string | null | undefined) {
  if (!avatarUrl?.startsWith(AVATAR_PREFIX)) return null;

  const cardId = avatarUrl.slice(AVATAR_PREFIX.length);
  return ALL_POKEMON_CARDS.find((card) => card.id === cardId)?.artwork ?? null;
}
