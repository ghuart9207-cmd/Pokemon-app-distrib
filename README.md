# pokemon-tcg-plateau
Jeu pokémon plateau 16 case tour par tour

Vicent : Pour ajouter un nouveau Pokémon

Prends l'exemple d'un « Salamèche ».

Étape 1 — L'image. Mets-la dans assets/images/, par exemple salameche-card.png.

Étape 2 — Le fichier de la carte. Crée src/features/game/data/pokemon/salameche.ts en copiant le modèle de pikachu.ts :

Code entre # :
#
import type { PokemonCard } from '@/features/game/types';

export const salameche: PokemonCard = {
  id: 'salameche-001',          // unique dans tout le jeu
  name: 'Salamèche',
  stage: 'base',                // 'base' | 'niveau1' | 'niveau2' | 'mega_ex'
  variant: 'normal',            // 'normal' | 'ex' | 'gx'
  type: 'feu',                  // electrique, feu, eau, plante, psy, combat,
                                // normal, obscurite, metal, fee
  maxHp: 70,
  retreatCost: 1,
  artwork: require('../../../../../assets/images/salameche-card.png'),
  attacks: [
    { name: 'Griffe', damage: 10, energyCost: 1 },
    {
      name: 'Flammèche',
      damage: 30,
      energyCost: 2,
      requiredEnergies: { feu: 1 }, // optionnel : énergies de types précis
    },
  ],
};
#

Le chemin du require doit avoir 5 ../ : c'est la profondeur autrement dit l'emplacement du dossier data/pokemon/ pour que ton ordi sache ou aller chercher le fichier. Les attaques acceptent beaucoup d'options (pile ou face, statuts, dégâts de banc, etc.). Le plus simple est de copier une carte existante qui fait déjà ce que tu veux : tous les champs possibles sont dans types/cards.ts (Attack, AttackEffect, PokemonTalent).

Étape 3 — L'exporter. Dans data/pokemon/index.ts, ajoute :

Code :
#
export * from './salameche';

Étape 4 — L'ajouter au jeu. Dans data/all-cards.ts, importe-le et ajoute-le dans la liste ALL_POKEMON_CARDS :

ts
import { salameche } from './pokemon/salameche';
// ...
export const ALL_POKEMON_CARDS: PokemonCard[] = [
  chenipan,
  // ...
  salameche,
];
#

Il apparaît alors tout seul sur l'écran de préparation.

Deux précisions :

Si ta carte utilise un effet qui n'existe pas encore, il faut d'abord l'ajouter dans les types (types/cards.ts), puis écrire sa logique dans rules/ ou dans le bon fichier de hooks/. Sinon TypeScript te l'indiquera.
Pour un Dresseur, c'est la même démarche dans data/trainers/, avec trainers/index.ts et la liste ALL_TRAINER_CARDS.

Pour ajouter une attaque :

Avec ce qui existe déjà :

Ajoute un objet dans le tableau attacks de la carte :

Code :
#
{
  name: 'Charge Brutale',
  damage: 50,
  energyCost: 2,                      // nombre total d'Énergies
  requiredEnergies: { combat: 1 },    // optionnel : types précis exigés
  effects: [{ type: 'recoil', amount: 20 }],   // le Pokémon se blesse de 20 si t'as besoin d'aide pour des valeurs manquantes parce que ça dépends des attaques demande
  effectText: 'Ce Pokémon s’inflige aussi 20 dégâts.',  // texte affiché
}
#

effectText est seulement le texte affiché : l'effet réel vient de effects et des autres champs.

Les champs de Attack (dans types/cards.ts) couvrent déjà beaucoup de cas :

Pile ou face : coinCount, coinEffects, coinDamageEffects, damagePerFace, damagePerPile, failsOn
Bonus de dégâts : bonusDamagePerOpponentBenchPokemon, bonusDamageIfTargetEvolved, bonusDamageIfSwitchedRecently, bonusDamageEveryTwoRounds, fixedDamage
Cible et banc : targetMode, benchDamageSameTypeAsTarget, secondaryBenchOrPlayerDamage
Autres : blocksNextOwnTurn

Les effets disponibles dans effects sont : heal, discardEnergy, recoverEnergy, recoverEnergyToBench, switchWithBench, discardTypedEnergy, recoil, poison, burn, paralyze, confuse, sleep, reduceDamageNextOpponentTurn, takeExtraDamageNextTurn, healAllOwnAndReturnSelf, healSelfByDamageDealt, forceOpponentActiveSwitch, attachEnergyToBench et discardAllTypedEnergyForBonus. Le sens de amount change selon l'effet : copie une carte qui l'utilise déjà, par exemple Scarhino pour forceOpponentActiveSwitch. 

# (C'est long de bz à écrire surtout quand il est 7h du matin et que je viens de me reveiller aled)

Avec un effet nouveau (types + code)
Déclare l'effet dans types/cards.ts : ajoute son nom dans AttackEffect.type, ou un nouveau champ optionnel dans Attack.
Implémente-le à l'endroit qui correspond à ce qu'il fait :
L'effet…	                                            Où le coder
modifie l'attaquant (soin, recul, défausse d'Énergie)	rules/attack-rules.ts, fonction applyAttackEffects (un if (effect.type === '…') par effet)
change le calcul des dégâts	                            getDisplayedAttackDamage (rules/attack-rules.ts) pour l'affichage, et hooks/use-game-attack-resolution.ts pour le calcul réel (le bonus par Pokémon de banc y apparaît à deux endroits)
agit sur la cible (statut, échange forcé)	            hooks/attack-resolution/hit-opponent-pokemon.ts
demande un choix au joueur	                            nouveau type dans types/pending.ts, état dans hooks/state/use-game-state.ts, et un handler dans hooks/cell-press/

Le dernier cas est le plus long, parce qu'il touche plusieurs fichiers.

Pour ajouter un talent :
Avec ce qui existe déjà :

Code :
#
talent: {
  name: 'Peau de Roche',
  type: 'passive',
  effect: 'preventDamageFromType',
  blockedType: 'feu',     // ignore les dégâts des Pokémon de type Feu
  description: 'Évite tous les dégâts infligés par les Pokémon de type Feu.',
},
#

Les cinq effets de talent qui existent, et où ils sont codés :

effect	                        Fait quoi	                                                  Fichier
blockBaseAttacks	            bloque les attaques des Pokémon de base	                      hooks/use-game-movement.ts
preventDamageFromType	        ignore les dégâts d'un type (blockedType)	                  hooks/use-game-combat-support.ts
damageOpponentOnPlay	        blesse l'adversaire quand il pose un Pokémon (amount)	      rules/board-rules.ts
surviveKOOnCoin	                pile ou face pour survivre à un K.O.	                      hooks/use-game-combat-support.ts
preventAllEffectsFromExGx	    immunise contre les ex et GX	                              hooks/use-game-combat-support.ts

Dans le code que j'ai lu y a pas de talents actifs : 'activated' existe dans le type, mais je n'ai trouvé aucun code qui déclenche un talent activé, et l'interface n'affiche que le texte des talents passifs. Un talent à activer à la main demanderait donc un vrai développement : bouton, état, logique ça prendrais longtemps mini vincent

Avec un effet nouveau

Exemple : un talent « Cuirasse » qui ignore les dégâts des Pokémon de base.

Dans types/cards.ts, ajoute 'preventDamageFromBasic' à la liste PokemonTalent.effect.
Dans la carte, mets effect: 'preventDamageFromBasic'.
Dans hooks/use-game-combat-support.ts, fonction doesTalentPreventDamage, ajoute après const talent = target.card.talent; :

Code :
#
if (
  talent?.type === 'passive' &&
  talent.effect === 'preventDamageFromBasic' &&
  attacker.card.stage === 'base'
) {
  return true;
}
#

Cette fonction est appelée pour le Pokémon actif et pour les Pokémon de banc visés, donc un seul endroit suffit.

L'endroit à modifier dépend de quand le talent agit :

Il empêche des dégâts : doesTalentPreventDamage.
Il agit à la pose d'un Pokémon : comme damageOpponentOnPlay, dans rules/board-rules.ts, avec le handler hooks/cell-press/handle-pokemon-placement.ts.
Il agit à un K.O. : hooks/use-game-combat-support.ts (handleAttackerKO, startKOSurvivalTalent).
Il réduit les dégâts reçus : aucun talent ne le fait encore mais en prévision. La logique de réduction existante est dans hit-opponent-pokemon.ts (cherche « Réduction de dégâts »), à deux endroits : cible active et banc. 
# L'accent sur réduction est important pour le ctrl + f

Pour vérifier ses modifications

Après chaque changement, lance dans le terminal :

npx tsc --noEmit

# Btw ceci est du markdown c'est du style de texte que tu peux ajouter par exemple avec le "#" qui fait ceci ( ça fonctionne sur discord )