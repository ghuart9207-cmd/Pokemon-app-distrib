import type { PokemonCard, TrainerCard } from '@/features/game/types';
import { leviator } from './pokemon';
import { bouldeneu } from './pokemon/bouldeneu';
import { boumata } from './pokemon/boumata';
import { chenipan } from './pokemon/chenipan';
import { coxyclaque } from './pokemon/coxyclaque';
import { cradopaud } from './pokemon/cradopaud';
import { denticrisse } from './pokemon/denticrisse';
import { dracaufeuGx } from './pokemon/dracaufeu-gx';
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
import { papilusion } from './pokemon/papilusion';
import { persian } from './pokemon/persian';
import { pikachu } from './pokemon/pikachu';
import { rafflesia } from './pokemon/rafflesia';
import { reptincel } from './pokemon/reptincel';
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
import { superRappel } from './trainers/super-rappel';

// Pour ajouter une carte : crée son fichier dans `pokemon/` ou `trainers/`,
// puis ajoute-la à la liste correspondante ci-dessous.

export const ALL_POKEMON_CARDS: PokemonCard[] = [
  chenipan,
  papilusion,
  rafflesia,
  bouldeneu,
  coxyclaque,
  scarhino,
  feuiloutan,
  sarmurai,
  reptincel,
  dracaufeuGx,
  hoohGx,
  flamoutan,
  malamandreGx,
  boumata,
  feunardalola,
  hyporoi,
  magicarpe,
  leviator,
  denticrisse,
  tokopiscoGx,
  pikachu,
  noctunoir,
  cradopaud,
  necrozmaGx,
  mackogneurGx,
  persian,
  frison,
  
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
];
