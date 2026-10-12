/** Joueur tel que renvoyé par le serveur (jamais de mot de passe). */
export type Player = {
  id: number;
  pseudo: string;
  /** Image de profil, au format `card:<id de la carte>` (ou une valeur par défaut). */
  avatarUrl: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  elo: number;
  createdAt: string;
  email?: string | null;
};

export type RegisterInput = {
  pseudo: string;
  password: string;
  email?: string;
  avatar: string;
};
