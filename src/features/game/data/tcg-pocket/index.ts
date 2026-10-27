import type { PokemonCard, TrainerCard } from '@/features/game/types';
import { bulbizarretcg } from './bulbizarre-tcg';
import { herbizarre } from './herbizarre-tcg';


// =============================================================
// CARTES POKÉMON TCG POCKET
// =============================================================
// Pour ajouter une carte : crée son fichier dans ce dossier
// (par exemple `pikachu-ex.ts`), importe-la ici, puis ajoute-la
// à la liste correspondante.
//
// IMPORTANT : l'`id` d'une carte TCG Pocket doit être différent
// de tous les id Soleil et Lune. Conseil : commence-les par
// « pocket- » (ex : id: 'pocket-pikachu-ex-001').
// =============================================================

export const POCKET_POKEMON_CARDS: PokemonCard[] = [
bulbizarretcg,
herbizarre,
];

export const POCKET_TRAINER_CARDS: TrainerCard[] = [];
