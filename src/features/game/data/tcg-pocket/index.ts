import type { PokemonCard, TrainerCard } from '@/features/game/types';
import { bulbizarretcg } from './bulbizarre-tcg';
import {  herbizarretcg } from './herbizarre-tcg';
import { florizarreextcg } from './florizarreex-tcg';
import { aspicottcg } from './aspicot-tcg';
import { coconforttcg } from './coconfort-tcg';
import { dardargnanextcg } from './dardagnanex-tcg';
import { noeunoeuftcg } from './noeunoeuf-tcg';
import { papilusiontcg } from './papilusion-tcg';
import { rafflesiaTCG } from './rafflesia-tcg';
import { noadkokoextcg } from './noadkokoex-tcg';
import { fragiladytcg } from './fragilady-tcg';
import { dracaufeutcg } from './dracaufeu-tcg';
import { dracaufeuextcg } from './dracaufeuex-tcg';
import { feunardtcg } from './feunard-tcg';
import { sulfuraextcg } from './sulfuraex-tcg';
import { tortankextcg } from './tortankex-tcg';
import { tartardtcg } from './tartard-tcg';

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
herbizarretcg,
florizarreextcg,
papilusiontcg,
rafflesiaTCG,
noeunoeuftcg,
noadkokoextcg,
fragiladytcg,
aspicottcg,
coconforttcg,
dardargnanextcg,
dracaufeutcg,
dracaufeuextcg,
feunardtcg,
sulfuraextcg,
tortankextcg,
tartardtcg,


];

export const POCKET_TRAINER_CARDS: TrainerCard[] = [];
