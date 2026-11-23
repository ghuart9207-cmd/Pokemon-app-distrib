import type { PokemonCard, TrainerCard } from '@/features/game/types';
import { cynthia } from './cynthia';
import { pingoleon } from './pingoleon';
import { godrive } from './godrive';
import { carchacrok } from './carchacrok';
import { draieul } from './draieul';
import { torterra } from './torterra';
import { phyllaligx } from './phyllaligx';
import { maganon } from './maganon';
import { simiabraz } from './simiabraz';
import { ouisticram } from './ouisticram';
import { ouisticram2 } from './ouisticram2';
import { malamandre2 } from './malamandre2';
import { boumata3 } from './boumata3';
import { sablaireaudalola2 } from './sablaireaudalola2';
import { tiplouf } from './tiplouf';
import { givraligx } from './givraligx';
import { luxray } from './luxray';
import { baudrive } from './baudrive';
import { cradopaud2 } from './cradopaud2';
import { cresselia } from './cresselia';
import { cosmog } from './cosmog';
import { necrozmaauroregx } from './necrozmaauroregx';
import { charkos } from './charkos';
import { hippodocus } from './hippodocus';
import { moufflair } from './moufflair';
import { magnezone } from './magnezone';
import { bastiodon } from './bastiodon';
import { archeomire } from './archeomire';
import { archeodong } from './archeodong';
import { heatran } from './heatran';
import { necrozmacouchantgx } from './necrozmacouchantgx.ts';
import { magearna } from './magearna';
import { spododo2 } from './spododo2';
import { lampignon2 } from './lampignon2';
import { dialgagx } from './dialgagx';
import { palkiagx } from './palkiagx';
import { laporeille } from './laporeille';
import { chaglam } from './chaglam';
import { shaymin } from './shaymin';
import { silvalliegx } from './silvalliegx';


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
torterra,
phyllaligx,
maganon,
ouisticram,
ouisticram2,
simiabraz,
malamandre2,
boumata3,
sablaireaudalola2,
tiplouf,
pingoleon,
givraligx,
luxray,
baudrive,
godrive,
cradopaud2,
cresselia,
cosmog,
necrozmaauroregx,
charkos,
hippodocus,
moufflair,
magnezone,
bastiodon,
archeomire,
archeodong,
heatran,
necrozmacouchantgx,
magearna,
spododo2,
lampignon2,
carchacrok,
dialgagx,
palkiagx,
laporeille,
chaglam,
shaymin,
silvalliegx,
draieul,
];

export const ULTRA_PRISME_TRAINER_CARDS: TrainerCard[] = [cynthia];
