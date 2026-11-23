
import type { CellPressContext } from './cell-press-context';

/** Gère le choix du Pokémon qui reçoit l'Énergie d'un Talent. */
export function handleTalentEnergyAttachment(
  context: CellPressContext,
  cellName: string
): boolean {
  const {
    board,
    currentPlayer,
    turnId,
    pendingTalentEnergyAttachment,
    setBoard,
    setMessage,
    setPendingTalentEnergyAttachment,
  } = context;

  // Aucun Talent en attente : laisser les autres gestionnaires agir.
  if (!pendingTalentEnergyAttachment) {
    return false;
  }

  const pending = pendingTalentEnergyAttachment;

  // Empêche de terminer une action appartenant à un ancien tour.
  if (pending.player !== currentPlayer || pending.turnId !== turnId) {
    setPendingTalentEnergyAttachment(null);
    setMessage("Le tour a changé. Le choix du Talent a été annulé.");
    return true;
  }

  const source = board[pending.sourceCell];
  const target = board[cellName];

  // Vérifie que le Pokémon qui a lancé le Talent existe toujours.
  if (!source || source.owner !== pending.player) {
    setPendingTalentEnergyAttachment(null);
    setMessage("Le Pokémon qui possède le Talent n'est plus disponible.");
    return true;
  }

  if (!target) {
    setMessage("Choisis un de tes Pokémon pour recevoir l'Énergie.");
    return true;
  }

  if (target.owner !== pending.player) {
    setMessage("Tu dois choisir l'un de tes propres Pokémon.");
    return true;
  }

  // La restriction de type est facultative.
  if (
    pending.targetPokemonType &&
    target.card.type !== pending.targetPokemonType
  ) {
    setMessage(
      `Choisis un Pokémon de type ${pending.targetPokemonType}.`
    );
    return true;
  }

  // Un même Pokémon ne peut pas réutiliser ce Talent pendant le même tour.
  if (source.lastUsedTalentTurnId === pending.turnId) {
    setPendingTalentEnergyAttachment(null);
    setMessage("Ce Pokémon a déjà utilisé son Talent pendant ce tour.");
    return true;
  }

  const amount = Math.max(1, Math.floor(pending.amount));
  const addedEnergies = Array(amount).fill(pending.energyType);

  setBoard((previousBoard) => {
    const currentSource = previousBoard[pending.sourceCell];
    const currentTarget = previousBoard[cellName];

    // Nouvelle vérification au moment de modifier le plateau.
    if (
      !currentSource ||
      !currentTarget ||
      currentSource.owner !== pending.player ||
      currentTarget.owner !== pending.player ||
      currentSource.lastUsedTalentTurnId === pending.turnId ||
      (pending.targetPokemonType &&
        currentTarget.card.type !== pending.targetPokemonType)
    ) {
      return previousBoard;
    }

    const nextBoard = { ...previousBoard };

    // Si le Pokémon cible est aussi celui qui utilise le Talent,
    // on met à jour sa case une seule fois.
    if (pending.sourceCell === cellName) {
      nextBoard[cellName] = {
        ...currentSource,
        energies: [...currentSource.energies, ...addedEnergies],
        lastUsedTalentTurnId: pending.turnId,
      };
    } else {
      nextBoard[pending.sourceCell] = {
        ...currentSource,
        lastUsedTalentTurnId: pending.turnId,
      };

      nextBoard[cellName] = {
        ...currentTarget,
        energies: [...currentTarget.energies, ...addedEnergies],
      };
    }

    return nextBoard;
  });

  setMessage(
    `${target.card.name} reçoit ${amount} Énergie ${pending.energyType} grâce au Talent de ${source.card.name}.`
  );

  setPendingTalentEnergyAttachment(null);
  return true;
}
