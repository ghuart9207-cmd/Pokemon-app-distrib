import type { PokemonCard, TrainerCard } from '@/features/game/types';
import { cynthia } from './cynthia';
import { pingoleon } from './pingoleon';
import { godrive } from './godrive';
import { carchacrok } from './carchacrok';
import { draieul } from './draieul';

// =============================================================
// EXTENSION « ULTRA PRISME » (série Soleil et Lune)
// =============================================================
// Pour ajouter une carte : crée son fichier dans ce dossier
// (par exemple `pikachu.ts`), importe-la ici, puis ajoute-la
// à la liste correspondante. Elle apparaîtra dans le panneau
// « Ultra Prisme » du choix du deck (les Dresseurs dans le
// panneau « Dresseurs »).
//
// Chaque `id` doit être unique dans tout le jeu.
// =============================================================

export const ULTRA_PRISME_POKEMON_CARDS: PokemonCard[] = [
pingoleon,
godrive,
carchacrok,
draieul,
];

export const ULTRA_PRISME_TRAINER_CARDS: TrainerCard[] = [cynthia];
