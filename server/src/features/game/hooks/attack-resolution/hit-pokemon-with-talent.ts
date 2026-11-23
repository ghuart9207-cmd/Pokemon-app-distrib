
import { isTalentNegated } from '@/features/game/rules';
import type { BoardState, PokemonInPlay } from '@/features/game/types';
import type { AttackResolutionContext } from './attack-resolution-context';

export function hitPokemonWithTalent(
  context: AttackResolutionContext,
  boardAfterAttack: BoardState,
  amount: number,
  attacker: PokemonInPlay,
  attackName: string
): void {
  const {
    doesTalentPreventDamage,
    handleAttackerKO,
    setBoard,
    setMessage,
    setSelectedPokemonCell,
    setSelectedAttackIndex,
  } = context;

  const damage = Math.max(0, amount);
  const nextBoard = { ...boardAfterAttack };

  let survivalPromptStarted = false;

  for (const [cell, pokemon] of Object.entries(nextBoard)) {
    // Ignorer les cases vides et les Pokémon sans Talent.
    if (!pokemon || !pokemon.card.talent) {
      continue;
    }

    // Pokémon-GX/EX dont le Talent est annulé (même colonne) : il n'a pas de Talent.
    if (isTalentNegated(pokemon, boardAfterAttack, cell)) {
      continue;
    }

    // Protection temporaire contre les attaques.
    const temporaryProtection =
      pokemon.preventAllAttackDamageAndEffects === true;

    // Protection accordée par un Talent.
    const talentProtection = doesTalentPreventDamage(
      pokemon,
      attacker
    );

    // Réduction temporaire des dégâts.
    const damageReduction =
      pokemon.attackDamageReductionEndPlayer === attacker.owner
        ? (pokemon.attackDamageReduction ?? 0)
        : 0;

    const damageToPokemon =
      temporaryProtection || talentProtection
        ? 0
        : Math.max(0, damage - damageReduction);

    if (damageToPokemon === 0) {
      continue;
    }

    const damagedPokemon: PokemonInPlay = {
      ...pokemon,
      currentHp: pokemon.currentHp - damageToPokemon,
    };

    nextBoard[cell] = damagedPokemon;

    // Le Pokémon survit.
    if (damagedPokemon.currentHp > 0) {
      continue;
    }

    // Gérer le K.O. avec le système déjà utilisé par le jeu.
    const wasKnockedOut = handleAttackerKO(
      nextBoard,
      damagedPokemon,
      cell
    );

    if (
      !wasKnockedOut &&
      damagedPokemon.card.talent?.effect === 'surviveKOOnCoin'
    ) {
      survivalPromptStarted = true;
    }
  }

  setBoard(nextBoard);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  // Ne pas remplacer le message demandant le lancer de pièce.
  if (!survivalPromptStarted) {
    setMessage(
      `${attacker.card.name} utilise ${attackName} : ${damage} dégâts à chaque Pokémon ayant un Talent, après protections et réductions éventuelles.`
    );
  }
}
