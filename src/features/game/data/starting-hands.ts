import type { GameCard, Player } from '@/features/game/types';
import { boumata } from './pokemon/boumata';
import { chenipan } from './pokemon/chenipan';
import { cradopaud } from './pokemon/cradopaud';
import { denticrisse } from './pokemon/denticrisse';
import { dracaufeuGx } from './pokemon/dracaufeu-gx';
import { flamoutan } from './pokemon/flamoutan';
import { frison } from './pokemon/frison';
import { hyporoi } from './pokemon/hyporoi';
import { mackogneurGx } from './pokemon/mackogneur-gx';
import { necrozmaGx } from './pokemon/necrozma-gx';
import { noctunoir } from './pokemon/noctunoir';
import { persian } from './pokemon/persian';
import { pikachu } from './pokemon/pikachu';
import { rafflesia } from './pokemon/rafflesia';
import { reptincel } from './pokemon/reptincel';
import { tokopiscoGx } from './pokemon/tokopisco-gx';
import { cordeSortie } from './trainers/corde-sortie';
import { guzma } from './trainers/guzma';
import { haltere } from './trainers/haltere';
import { kiawe } from './trainers/kiawe';
import { margie } from './trainers/margie';
import { nephie } from './trainers/nephie';
import { potion } from './trainers/potion';
import { relais } from './trainers/relais';
import { superRappel } from './trainers/super-rappel';

export const STARTING_HANDS: Record<Player, GameCard[]> = {
  1: [
    pikachu,
    necrozmaGx,
    reptincel,
    dracaufeuGx,
    boumata,
    denticrisse,
    rafflesia,
    noctunoir,
    potion,
    cordeSortie,
    haltere,
    kiawe,
    margie,
  ],
  2: [
    cradopaud,
    frison,
    mackogneurGx,
    persian,
    hyporoi,
    chenipan,
    flamoutan,
    tokopiscoGx,
    relais,
    superRappel,
    nephie,
    guzma,
  ],
};
