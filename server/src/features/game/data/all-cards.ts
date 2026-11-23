import type { PokemonCard, TrainerCard } from '@/features/game/types';
import { anchwatt, araqua, azumarill, bacabouh, bombydou, bourrinos, brutapode, bruyvernegx, chrysacier, coatox, coxy, crabagarre, crabominable, darkraigx, diancie, dimoret, elekable, farfuret, feuillajou, flamajou, flotajou, flotoutan, gardevoirgx, goupixdalola, grotadmorvdalolagx, hoothoot, hypocean, hypotrempe, karaclee, kirlia, lamperoie, lampignon, leviator, lougaroc, lougaroc2, lougarocgx, lucario, marill, marshadowgx, miaouss, mistigrix, mystherbe, nounourson, ohmassacre, porygon, psytigri, qulbutoke, rattatacdalola, rattatadalola, rhinocorne, rhinoferos, riolu, scobolide, seleroc, sepiatop, sepiatroce, seviper, skelenox, sonistrelle, sovkipou, spododo, tadmorvdalola, tarenbulle, tarsal, teraclope, tiboudet, togedemaru, tokotorogx, trepassable, venipatte, zygarde } from './pokemon';
import { bouldeneu } from './pokemon/bouldeneu';
import { boumata } from './pokemon/boumata';
import { chenipan } from './pokemon/chenipan';
import { coxyclaque } from './pokemon/coxyclaque';
import { cradopaud } from './pokemon/cradopaud';
import { denticrisse } from './pokemon/denticrisse';
import { dracaufeuGx } from './pokemon/dracaufeu-gx';
import { elektek } from './pokemon/elektek';
import { feuiloutan } from './pokemon/feuiloutan';
import { feunardalola } from './pokemon/feunardalola';
import { flamoutan } from './pokemon/flamoutan';
import { frison } from './pokemon/frison';
import { hoohGx } from './pokemon/hooh-gx';
import { hyporoi } from './pokemon/hyporoi';
import { mackogneurGx } from './pokemon/mackogneur-gx';
import { magicarpe } from './pokemon/magicarpe';
import { malamandreGx } from './pokemon/malamandre-gx';
import { necrozmaGx } from './pokemon/necrozma-gx';
import { noctunoir } from './pokemon/noctunoir';
import { ortide } from './pokemon/ortide';
import { papilusion } from './pokemon/papilusion';
import { persian } from './pokemon/persian';
import { pikachu } from './pokemon/pikachu';
import { porygonz } from './pokemon/porygonz';
import { quartermac } from './pokemon/quartermac';
import { rafflesia } from './pokemon/rafflesia';
import { raichu } from './pokemon/raichu';
import { reptincel } from './pokemon/reptincel';
import { salameche } from './pokemon/salameche';
import { saquedeneu } from './pokemon/saquedeneu';
import { sarmurai } from './pokemon/sarmurai';
import { scarhino } from './pokemon/scarhino';
import { tokopiscoGx } from './pokemon/tokopisco-gx';
import { cordeSortie } from './trainers/corde-sortie';
import { fanclubPokemon } from './trainers/fanclub-pokemon';
import { guzma } from './trainers/guzma';
import { haltere } from './trainers/haltere';
import { kiawe } from './trainers/kiawe';
import { margie } from './trainers/margie';
import { nephie } from './trainers/nephie';
import { potion } from './trainers/potion';
import { relais } from './trainers/relais';
import { skateboard } from './trainers/skateboard-evasion';
import { superRappel } from './trainers/super-rappel';
import { flo } from './trainers/flo';


// Pour ajouter une carte : crée son fichier dans `pokemon/` ou `trainers/`,
// puis ajoute-la à la liste correspondante ci-dessous.

export const ALL_POKEMON_CARDS: PokemonCard[] = [
  chenipan,
  chrysacier,
  papilusion,
  mystherbe,
  ortide,
  rafflesia,
  saquedeneu,
  bouldeneu,
  coxy,
  coxyclaque,
  scarhino,
  feuillajou,
  feuiloutan,
  araqua,
  tarenbulle,
  sovkipou,
  sarmurai,
  tokotorogx,
  salameche,
  reptincel,
  dracaufeuGx,
  hoohGx,
  flamajou,
  flamoutan,
  malamandreGx,
  boumata,
  goupixdalola,
  feunardalola,
  hypotrempe,
  hypocean,
  hyporoi,
  magicarpe,
  leviator,
  marill,
  azumarill,
  flotajou,
  flotoutan,
  denticrisse,
  tokopiscoGx,
  pikachu,
  raichu,
  elektek,
  elekable,
  anchwatt,
  lamperoie,
  ohmassacre,
  togedemaru,
  qulbutoke,
  seviper,
  skelenox,
  teraclope,
  noctunoir,
  cradopaud,
  coatox,
  venipatte,
  scobolide,
  brutapode,
  psytigri,
  mistigrix,
  bacabouh,
  trepassable,
  necrozmaGx,
  mackogneurGx,
  rhinocorne,
  rhinoferos,
  seleroc,
  riolu,
  lucario,
  karaclee,
  crabagarre,
  crabominable,
  lougaroc2,
  lougaroc,
  lougarocgx,
  tiboudet,
  bourrinos,
  quartermac,
  marshadowgx,
  rattatadalola,
  rattatacdalola,
  tadmorvdalola,
  grotadmorvdalolagx,
  farfuret,
  dimoret,
  darkraigx,
  sepiatop,
  sepiatroce,
  tarsal,
  kirlia,
  gardevoirgx,
  diancie,
  bombydou,
  spododo,
  lampignon,
  bruyvernegx,
  zygarde,
  miaouss,
  persian,
  porygon,
  porygonz,
  hoothoot,
  frison,
  sonistrelle,
  nounourson,
  
];

export const ALL_TRAINER_CARDS: TrainerCard[] = [
  cordeSortie,
  guzma,
  haltere,
  kiawe,
  margie,
  nephie,
  potion,
  relais,
  superRappel,
  fanclubPokemon,
  skateboard,
  flo,
];
