import type { PendingKOEnergyMove, Player, PokemonInPlay, GameCard, PendingDiscardTalentPlacement, SetupPhase } from '@/features/game/types';
import type { GameState } from './state/use-game-state';
import {
  getBenchRow,
  getDiscardSummonCandidates,
  getPokemonMaxHp,
  isHealBlocked,
  isPokemonCard,
  isTalentNegated,
} from '@/features/game/rules';
import type { AttackEffect, EnergyType } from '@/features/game/types';
import { applyKOEnergyMove } from './cell-press/apply-ko-energy-move';
import { selectEnergyGatherType } from './cell-press/handle-energy-gather';

type GameScreenActionsOptions = Pick<
  GameState,
  | 'board'
  | 'player1Discard'
  | 'player2Discard'
  | 'openedDiscardPlayer'
  | 'selectedPokemonCell'
  | 'selectedAttachedTool'
  | 'setOpenedDiscardPlayer'
  | 'setSelectedAttachedTool'
  | 'setSelectedPokemonCell'
  | 'setSelectedAttackIndex'
  | 'setPendingKOEnergyMove'
  | 'pendingKOEnergyMove'
  | 'setBoard'
  | 'setPlayer1DiscardEnergies'
  | 'setPlayer2DiscardEnergies'
  | 'setPendingInvocationPlacement'
  | 'setMessage'
  | 'currentPlayer'
  | 'turnId'
  | 'setPendingTalentEnergyAttachment'
  | 'setPendingDamageCounterMove'
  | 'setPendingTalentHeal'
  | 'setPendingTalentToolReturn'
  | 'player1SummonChoices'
  | 'player2SummonChoices'
  | 'pendingDiscardSummon'
  | 'player1Hand'
  | 'player2Hand'
  | 'setPlayer1Hand'
  | 'setPlayer2Hand'
  | 'pendingEnergyGather'
  | 'setPendingEnergyGather'
  | 'setPendingPokemonSwitch'
  | 'inspectedPokemonCell'
  | 'setInspectedPokemonCell'
  | 'setInspectedHandCard'
  | 'setForfeitedPlayer'
  | 'setGameOver'
  | 'setPendingDiscardSummon'
  | 'gameOver'
  | 'player1DiscardEnergies'
  | 'player2DiscardEnergies'
  | 'pendingDiscardTalentPlacement'
  | 'usedDiscardTalentKeys'
  | 'setPendingDiscardTalentPlacement'
  | 'setUsedDiscardTalentKeys'
  | 'setSelectedCard'
  | 'setSelectedTrainerCard'
  | 'setSelectedPokemonCell'
  | 'setSelectedAttackIndex'
> & {
  endTurn: () => void;
  // Phase de la partie (l'abandon n'est possible que pendant le combat).
  setupPhase: SetupPhase;
};

/** Petits handlers qui relient les composants de l'écran de jeu à l'état. */
export function useGameScreenActions({
  board,
  player1Discard,
  player2Discard,
  openedDiscardPlayer,
  selectedPokemonCell,
  selectedAttachedTool,
  setOpenedDiscardPlayer,
  setSelectedAttachedTool,
  setSelectedPokemonCell,
  setSelectedAttackIndex,
  setPendingKOEnergyMove,
  pendingKOEnergyMove,
  setBoard,
  setPlayer1DiscardEnergies,
  setPlayer2DiscardEnergies,
  setPendingInvocationPlacement,
  setMessage,
  currentPlayer,
  turnId,
  setPendingTalentEnergyAttachment,
  setPendingDamageCounterMove,
  setPendingTalentHeal,
  setPendingTalentToolReturn,
  player1SummonChoices,
  player2SummonChoices,
  pendingDiscardSummon,
  setPendingDiscardSummon,
  player1Hand,
  player2Hand,
  setPlayer1Hand,
  setPlayer2Hand,
  pendingEnergyGather,
  setPendingEnergyGather,
  setPendingPokemonSwitch,
  inspectedPokemonCell,
  setInspectedPokemonCell,
  setInspectedHandCard,
  setForfeitedPlayer,
  setGameOver,
  setupPhase,
  endTurn,
  gameOver,
  player1DiscardEnergies,
  player2DiscardEnergies,
  pendingDiscardTalentPlacement,
  usedDiscardTalentKeys,
  setPendingDiscardTalentPlacement,
  setUsedDiscardTalentKeys,
  setSelectedCard,
  setSelectedTrainerCard,
}: GameScreenActionsOptions) {
  const selectedPokemon = selectedPokemonCell ? board[selectedPokemonCell] : null;

  // Pokémon adverse consulté (sans pouvoir l'utiliser).
  const inspectedPokemon = inspectedPokemonCell ? board[inspectedPokemonCell] : null;
  const openedDiscardCards = openedDiscardPlayer === 1 ? player1Discard : player2Discard;

  function handleToggleDiscard(player: Player) {
    setOpenedDiscardPlayer((previous) => (previous === player ? null : player));
  }

  function handleCloseDiscardPreview() {
    setOpenedDiscardPlayer(null);
  }

  function handleDiscardCardPress(
  card: GameCard,
  index: number,
  player: Player
) {
  // Ce Talent ne concerne que les Pokémon qui le possèdent.
  if (
    !isPokemonCard(card) ||
    card.talent?.effect !== 'recoverFromDiscardOncePerGame'
  ) {
    return;
  }

  if (gameOver) {
    setMessage("La partie est terminée.");
    return;
  }

  if (player !== currentPlayer || openedDiscardPlayer !== currentPlayer) {
    setMessage("Tu peux uniquement utiliser ce Talent depuis ta propre défausse pendant ton tour.");
    return;
  }

  if (pendingDiscardTalentPlacement) {
    setMessage("Choisis d'abord la case où placer le Pokémon déjà sélectionné.");
    return;
  }

  const discard = player === 1 ? player1Discard : player2Discard;

  // Vérifier que la carte est toujours à cette position.
  const discardIndex =
    discard[index] === card
      ? index
      : discard.findIndex((discardCard) => discardCard === card);

  if (discardIndex === -1) {
    setMessage("Ce Pokémon n'est plus dans la défausse.");
    return;
  }

  const usedKey = `${player}:${card.id}`;

  if (usedDiscardTalentKeys.includes(usedKey)) {
    setMessage(`${card.name} a déjà utilisé ce Talent pendant cette partie.`);
    return;
  }

  // Joueur 1 : B1-B4. Joueur 2 : C1-C4.
const allowedRow = player === 1 ? 'B' : 'C';

const hasFreeBoardSpace = [1, 2, 3, 4].some(
  (column) => !board[`${allowedRow}${column}`]
);

if (!hasFreeBoardSpace) {
  setMessage(
    `Aucune case libre sur la rangée ${allowedRow}. Libère une case avant d'utiliser ce Talent.`
  );
  return;
}

  const discardEnergies =
    player === 1 ? player1DiscardEnergies : player2DiscardEnergies;

  const hasDarkEnergy = discardEnergies.includes('obscurite');

  setPendingDiscardTalentPlacement({
    player,
    card,
    discardIndex,
  });

  // Éviter qu'une carte sélectionnée ailleurs perturbe le placement.
  setSelectedCard(null);
  setSelectedTrainerCard(null);
  setSelectedPokemonCell(null);
  setSelectedAttackIndex(null);

  setMessage(
    hasDarkEnergy
      ? `${card.name} : choisis une case vide de ton banc. Une Énergie Obscurité de ta défausse lui sera attachée.`
      : `${card.name} : choisis une case vide de ton banc. Aucune Énergie Obscurité n'est disponible dans ta défausse.`
  );
}

  /** Sélectionne (ou désélectionne) l'Outil attaché à un Pokémon pour l'afficher. */
  function handleToolPress(cellName: string, pokemon: PokemonInPlay) {
    const tool = pokemon.attachedTool;

    if (!tool) return;

    if (selectedAttachedTool?.cellName === cellName) {
      setSelectedAttachedTool(null);
      return;
    }

    setSelectedAttachedTool({ card: tool, cellName });
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
  }

  function handleSelectKOEnergy(energy: PendingKOEnergyMove['selectedEnergy']) {
    // Relais Optimiste : la cible est déjà choisie,
    // la deuxième Énergie lui est attachée tout de suite.
    if (pendingKOEnergyMove?.targetCell && energy) {
      applyKOEnergyMove(
        {
          board,
          setBoard,
          setMessage,
          setPendingKOEnergyMove,
          setPlayer1DiscardEnergies,
          setPlayer2DiscardEnergies,
        },
        pendingKOEnergyMove,
        energy,
        pendingKOEnergyMove.targetCell
      );
      return;
    }

    setPendingKOEnergyMove((previous) =>
      previous ? { ...previous, selectedEnergy: energy } : null
    );
  }

  function handleSelectInvocation(index: number) {
    setPendingInvocationPlacement((previous) =>
      previous ? { ...previous, selectedIndex: index } : null
    );
  }

  function handleSelectAttack(index: number, attackMessage: string) {
    setSelectedAttackIndex(index);
    setMessage(attackMessage);
  }

  function handleActivateTalent() {
    if (!selectedPokemon || !selectedPokemonCell) {
      setMessage('Sélectionne d’abord un Pokémon.');
      return;
    }

    const talent = selectedPokemon.card.talent;

    // Talent annulé par un Pokémon adverse de la même colonne.
    if (talent && isTalentNegated(selectedPokemon, board, selectedPokemonCell)) {
      setMessage(
        `${selectedPokemon.card.name} n'a plus de Talent : un Pokémon adverse de sa colonne annule les Talents des Pokémon-GX et EX.`
      );
      return;
    }

    // -----------------------------------------
    // TALENT : ÉCHANGER CE POKÉMON AVEC UNE CARTE DE LA MAIN
    // (ex : Froussardine -> Froussardine GX)
    // Tout reste : Outil, Énergies, dégâts, tours en jeu, états spéciaux,
    // effets, et le statut d'Invocation. L'ancienne carte retourne en main.
    // -----------------------------------------
    if (
      talent?.type === 'activated' &&
      talent.effect === 'swapWithCardFromHand' &&
      talent.swapCardId
    ) {
      if (selectedPokemon.owner !== currentPlayer) {
        setMessage('Tu ne peux utiliser que tes propres Talents.');
        return;
      }

      if (selectedPokemon.lastUsedTalentTurnId === turnId) {
        setMessage('Ce Pokémon a déjà utilisé son Talent pendant ce tour.');
        return;
      }

      const hand = currentPlayer === 1 ? player1Hand : player2Hand;
      const handIndex = hand.findIndex(
        (card) => isPokemonCard(card) && card.id === talent.swapCardId
      );
      const newCard = handIndex === -1 ? null : hand[handIndex];

      if (!newCard || !isPokemonCard(newCard)) {
        setMessage(`${talent.name} : la carte à échanger n'est pas dans ta main.`);
        return;
      }

      // Les dégâts déjà subis restent sur le nouveau Pokémon.
      const damageTaken = getPokemonMaxHp(selectedPokemon) - selectedPokemon.currentHp;
      const newHp = getPokemonMaxHp({ ...selectedPokemon, card: newCard }) - damageTaken;

      if (newHp <= 0) {
        setMessage(
          `${newCard.name} serait mis K.O. par les dégâts déjà subis : échange impossible.`
        );
        return;
      }

      const oldCard = selectedPokemon.card;
      const cell = selectedPokemonCell;

      setBoard((previousBoard) => {
        const current = previousBoard[cell];

        if (!current || current.card !== oldCard) {
          return previousBoard;
        }

        return {
          ...previousBoard,
          [cell]: {
            ...current,
            card: newCard,
            currentHp: newHp,
            lastUsedTalentTurnId: turnId,
          },
        };
      });

      // La carte échangée part de la main (une seule), l'ancienne y revient.
      const setHand = currentPlayer === 1 ? setPlayer1Hand : setPlayer2Hand;
      setHand((previousHand) => {
        const index = previousHand.findIndex((card) => card.id === newCard.id);
        const nextHand =
          index === -1
            ? [...previousHand]
            : previousHand.filter((_, cardIndex) => cardIndex !== index);

        return [...nextHand, oldCard];
      });

      setMessage(
        `${talent.name} : ${oldCard.name} est échangé avec ${newCard.name}` +
          (selectedPokemon.isInvocation ? ' (toujours une Invocation)' : '') +
          `. ${oldCard.name} retourne dans ta main.`
      );
      return;
    }

    // -----------------------------------------
    // TALENT : ÉCHANGER CE POKÉMON AVEC L'UN DE SES POKÉMON DE BANC
    // (une seule fois pendant votre tour ; échange horizontal sur la même ligne)
    // -----------------------------------------
    if (talent?.type === 'activated' && talent.effect === 'switchWithBenchOncePerTurn') {
      if (selectedPokemon.owner !== currentPlayer) {
        setMessage('Tu ne peux utiliser que tes propres Talents.');
        return;
      }

      if (selectedPokemon.lastUsedTalentTurnId === turnId) {
        setMessage('Ce Pokémon a déjà utilisé son Talent pendant ce tour.');
        return;
      }

      const row = selectedPokemonCell[0];
      const hasPartner = Object.entries(board).some(
        ([cell, pokemon]) =>
          pokemon !== null &&
          cell !== selectedPokemonCell &&
          cell[0] === row &&
          pokemon.owner === currentPlayer
      );

      if (!hasPartner) {
        setMessage(`${talent.name} : aucun de tes Pokémon n'est sur la même ligne pour l'échange.`);
        return;
      }

      setPendingPokemonSwitch({
        player: currentPlayer,
        attackerCell: selectedPokemonCell,
        fromTalentTurnId: turnId,
      });

      setMessage(
        `${talent.name} : choisis l'un de tes Pokémon sur la même ligne pour échanger avec ${selectedPokemon.card.name}. Clic sur une case vide pour annuler.`
      );
      return;
    }

    // -----------------------------------------
    // TALENT : UNE FOIS PAR TOUR, INVOQUER LE(S) POKÉMON CHOISI(S) À LA PRÉPARATION
    // -----------------------------------------
    if (talent?.type === 'activated' && talent.effect === 'summonOncePerTurn') {
      if (selectedPokemon.owner !== currentPlayer) {
        setMessage('Tu ne peux utiliser que tes propres Talents.');
        return;
      }

      if (selectedPokemon.lastUsedTalentTurnId === turnId) {
        setMessage('Ce Pokémon a déjà utilisé son Talent pendant ce tour.');
        return;
      }

      const choices = currentPlayer === 1 ? player1SummonChoices : player2SummonChoices;
      const chosen = choices[selectedPokemon.card.id] ?? [];

      if (chosen.length === 0) {
        setMessage(`${talent.name} : aucune Invocation n'a été choisie pour ${selectedPokemon.card.name} à la préparation.`);
        return;
      }

      const summonRow = currentPlayer === 1 ? 'B' : 'C';
      const freeCellCount = [1, 2, 3, 4].filter(
        (column) => board[`${summonRow}${column}`] === null
      ).length;

      if (freeCellCount === 0) {
        setMessage(`${talent.name} : aucune case libre de ${summonRow}1 à ${summonRow}4.`);
        return;
      }

      // Le Talent est utilisé dès maintenant (une seule fois par tour).
      const talentCell = selectedPokemonCell;
      setBoard((previousBoard) => {
        const current = previousBoard[talentCell];
        return current
          ? { ...previousBoard, [talentCell]: { ...current, lastUsedTalentTurnId: turnId } }
          : previousBoard;
      });

      const toPlace = Math.min(chosen.length, freeCellCount);

      setPendingInvocationPlacement({
        player: currentPlayer,
        cards: [...chosen],
        selectedIndex: null,
        source: 'attack',
        remainingToPlace: toPlace,
        title: talent.name,
      });

      setMessage(
        `${talent.name} : invoque ${chosen.map((card) => card.name).join(' et ')}. Choisis une Invocation puis une case libre de ${summonRow}1 à ${summonRow}4.`
      );
      return;
    }

    // -----------------------------------------
    // TALENT : REMETTRE EN MAIN UN OUTIL ATTACHÉ À L'UN DE SES POKÉMON
    // -----------------------------------------
    if (talent?.type === 'activated' && talent.effect === 'returnToolToHandOncePerTurn') {
      if (selectedPokemon.owner !== currentPlayer) {
        setMessage('Tu ne peux utiliser que tes propres Talents.');
        return;
      }

      if (selectedPokemon.lastUsedTalentTurnId === turnId) {
        setMessage('Ce Pokémon a déjà utilisé son Talent pendant ce tour.');
        return;
      }

      const hasToolOnOwnPokemon = Object.values(board).some(
        (pokemon) => pokemon !== null && pokemon.owner === currentPlayer && pokemon.attachedTool
      );

      if (!hasToolOnOwnPokemon) {
        setMessage(`Aucun de tes Pokémon ne porte de carte Outil : ${talent.name} est inutile.`);
        return;
      }

      setPendingTalentToolReturn({
        player: currentPlayer,
        sourceCell: selectedPokemonCell,
        turnId,
      });

      setMessage(
        `${talent.name} : choisis l'un de tes Pokémon qui porte un Outil pour le remettre dans ta main. Clic sur une case vide pour annuler.`
      );
      return;
    }

    // -----------------------------------------
    // TALENT : SOIGNER X DÉGÂTS À CHACUN DE SES POKÉMON
    // (une seule fois pendant votre tour, sans choix de cible)
    // -----------------------------------------
    if (talent?.type === 'activated' && talent.effect === 'healAllOwnPokemonOncePerTurn') {
      if (selectedPokemon.owner !== currentPlayer) {
        setMessage('Tu ne peux utiliser que tes propres Talents.');
        return;
      }

      if (selectedPokemon.lastUsedTalentTurnId === turnId) {
        setMessage('Ce Pokémon a déjà utilisé son Talent pendant ce tour.');
        return;
      }

      const amount = talent.amount ?? 20;
      const healedNames: string[] = [];

      for (const pokemon of Object.values(board)) {
        if (
          pokemon !== null &&
          pokemon.owner === currentPlayer &&
          !isHealBlocked(pokemon) &&
          pokemon.currentHp < getPokemonMaxHp(pokemon)
        ) {
          const healed = Math.min(amount, getPokemonMaxHp(pokemon) - pokemon.currentHp);
          healedNames.push(`${pokemon.card.name} (+${healed})`);
        }
      }

      if (healedNames.length === 0) {
        setMessage(`Aucun de tes Pokémon n'a de dégâts à soigner : ${talent.name} est inutile.`);
        return;
      }

      const talentCell = selectedPokemonCell;

      setBoard((previousBoard) => {
        const nextBoard = { ...previousBoard };

        for (const [cell, pokemon] of Object.entries(previousBoard)) {
          if (
            pokemon !== null &&
            pokemon.owner === currentPlayer &&
            !isHealBlocked(pokemon)
          ) {
            nextBoard[cell] = {
              ...pokemon,
              currentHp: Math.min(pokemon.currentHp + amount, getPokemonMaxHp(pokemon)),
            };
          }
        }

        const talentOwner = nextBoard[talentCell];
        if (talentOwner) {
          nextBoard[talentCell] = { ...talentOwner, lastUsedTalentTurnId: turnId };
        }

        return nextBoard;
      });

      setMessage(`${talent.name} : ${healedNames.join(', ')}.`);
      return;
    }

    // -----------------------------------------
    // TALENT : SOIGNER X DÉGÂTS À L'UN DE SES POKÉMON
    // (une seule fois pendant votre tour, avant ou après l'attaque)
    // -----------------------------------------
    if (talent?.type === 'activated' && talent.effect === 'healOwnPokemonOncePerTurn') {
      if (selectedPokemon.owner !== currentPlayer) {
        setMessage('Tu ne peux utiliser que tes propres Talents.');
        return;
      }

      if (selectedPokemon.lastUsedTalentTurnId === turnId) {
        setMessage('Ce Pokémon a déjà utilisé son Talent pendant ce tour.');
        return;
      }

      const hasDamagedOwnPokemon = Object.values(board).some(
        (pokemon) =>
          pokemon !== null &&
          pokemon.owner === currentPlayer &&
          !isHealBlocked(pokemon) &&
          pokemon.currentHp < getPokemonMaxHp(pokemon)
      );

      if (!hasDamagedOwnPokemon) {
        setMessage(`Aucun de tes Pokémon n'a de dégâts à soigner : ${talent.name} est inutile.`);
        return;
      }

      setPendingTalentHeal({
        player: currentPlayer,
        sourceCell: selectedPokemonCell,
        amount: talent.amount ?? 50,
        turnId,
      });

      setMessage(
        `${talent.name} : choisis l'un de tes Pokémon blessés à soigner de ${talent.amount ?? 50} dégâts. Clic sur une case vide pour annuler.`
      );
      return;
    }

    // -----------------------------------------
    // TALENT : DÉPLACER UN MARQUEUR DE DÉGÂTS
    // (Lugulabre — Déplacement Louche)
    // -----------------------------------------
    if (
      talent?.type === 'activated' &&
      talent.effect === 'moveDamageCounterOncePerTurn'
    ) {
      if (selectedPokemon.owner !== currentPlayer) {
        setMessage('Tu ne peux utiliser que tes propres Talents.');
        return;
      }

      // Règle maison : le Talent peut aussi être utilisé après l'attaque
      // (la carte dit « avant votre attaque »).

      if (selectedPokemon.lastUsedTalentTurnId === turnId) {
        setMessage('Ce Pokémon a déjà utilisé son Talent pendant ce tour.');
        return;
      }

      const hasDamagedPokemon = Object.values(board).some(
        (pokemon) =>
          pokemon !== null &&
          (!talent.fromOwnPokemonOnly || pokemon.owner === currentPlayer) &&
          pokemon.currentHp < getPokemonMaxHp(pokemon)
      );

      if (!hasDamagedPokemon) {
        setMessage(
          talent.fromOwnPokemonOnly
            ? `Aucun de tes Pokémon n'a de marqueur de dégâts : ${talent.name} est inutile.`
            : `Aucun Pokémon n'a de marqueur de dégâts : ${talent.name} est inutile.`
        );
        return;
      }

      setPendingDamageCounterMove({
        player: currentPlayer,
        sourceCell: selectedPokemonCell,
        fromCell: null,
        amount: talent.amount ?? 10,
        fromOwnPokemonOnly: talent.fromOwnPokemonOnly === true,
        turnId,
      });

      setMessage(
        talent.fromOwnPokemonOnly
          ? `${talent.name} : choisis l'un de TES Pokémon blessés qui donne un marqueur de dégâts. Clic sur une case vide pour annuler.`
          : `${talent.name} : choisis le Pokémon blessé (de n'importe quel camp) qui donne un marqueur de dégâts. Clic sur une case vide pour annuler.`
      );
      return;
    }

    if (
      selectedPokemon.owner !== currentPlayer ||
      !talent ||
      talent.type !== 'activated' ||
      talent.effect !== 'attachEnergyOncePerTurn' ||
      !talent.energyType
    ) {
      setMessage("Ce Pokémon ne possède pas ce Talent activable.");
      return;
    }

    if (selectedPokemon.lastUsedTalentTurnId === turnId) {
      setMessage('Ce Pokémon a déjà utilisé son Talent pendant ce tour.');
      return;
    }

    setPendingTalentEnergyAttachment({
      player: currentPlayer,
      sourceCell: selectedPokemonCell,
      energyType: talent.energyType,
      amount: talent.amount ?? 1,
      targetPokemonType: talent.targetPokemonType,
      turnId,
    });

    setMessage(
      `Talent de ${selectedPokemon.card.name} : choisis un de tes Pokémon pour recevoir une Énergie ${talent.energyType}.`
    );
  }

  // -----------------------------------------
  // INVOCATION DEPUIS UNE DÉFAUSSE : CHOIX DU POKÉMON
  // -----------------------------------------

  const discardSummonCandidates = pendingDiscardSummon
    ? getDiscardSummonCandidates(
        {
          type: 'summonFromAnyDiscard',
          amount: 1,
          pokemonType: pendingDiscardSummon.pokemonType,
          maxHp: pendingDiscardSummon.maxHp,
        } as AttackEffect,
        board,
        player1Discard,
        player2Discard
      )
    : [];

  function selectDiscardSummonCard(fromPlayer: Player, discardIndex: number) {
    if (!pendingDiscardSummon || pendingDiscardSummon.player !== currentPlayer) {
      return;
    }

    const candidate = discardSummonCandidates.find(
      (item) => item.fromPlayer === fromPlayer && item.discardIndex === discardIndex
    );

    if (!candidate) {
      setMessage('Ce Pokémon ne peut pas être invoqué.');
      return;
    }

    setPendingDiscardSummon({
      ...pendingDiscardSummon,
      selected: { fromPlayer, discardIndex, cardId: candidate.card.id },
    });

    const row = getBenchRow(fromPlayer);
    setMessage(
      `${candidate.card.name} sélectionné : choisis une case libre de ${row}1 à ${row}4.`
    );
  }

  // -----------------------------------------
  // TALENT À LA POSE : FIN DU DÉPLACEMENT D'ÉNERGIES
  // Si au moins une Énergie a été déplacée, ce Pokémon doit
  // échanger sa place avec un Pokémon de la même ligne.
  // -----------------------------------------
  function finishEnergyGather() {
    const pending = pendingEnergyGather;

    if (!pending || pending.player !== currentPlayer) {
      return;
    }

    setPendingEnergyGather(null);

    // Effet d'attaque : simple fin, pas d'échange.
    if (pending.fromAttack) {
      setMessage(`${pending.talentName} : fin de l'effet (${pending.moved} Énergie(s) déplacée(s)).`);
      return;
    }

    const receiver = board[pending.targetCell];

    if (!receiver || pending.moved === 0) {
      setMessage(`${pending.talentName} : aucune Énergie déplacée, pas d'échange.`);
      return;
    }

    const row = pending.targetCell[0];
    const hasRowPartner = Object.entries(board).some(
      ([cell, pokemon]) =>
        cell !== pending.targetCell &&
        cell[0] === row &&
        pokemon !== null &&
        pokemon.owner === currentPlayer
    );

    if (!hasRowPartner) {
      setMessage(
        `${pending.talentName} : ${pending.moved} Énergie(s) déplacée(s). Aucun autre Pokémon sur la ligne ${row} : pas d'échange.`
      );
      return;
    }

    setPendingPokemonSwitch({ player: currentPlayer, attackerCell: pending.targetCell });
    setMessage(
      `${pending.talentName} : ${pending.moved} Énergie(s) déplacée(s). Choisis maintenant un de tes Pokémon de la ligne ${row} avec qui ${receiver.card.name} échange sa place.`
    );
  }

  /** Choix du type d'Énergie à déplacer (Pokémon qui en a plusieurs). */
  function selectEnergyGatherEnergy(energy: EnergyType) {
    if (!pendingEnergyGather || pendingEnergyGather.player !== currentPlayer) return;

    selectEnergyGatherType(
      { board, pendingEnergyGather, setPendingEnergyGather, setBoard, setMessage },
      energy
    );
  }

  // -----------------------------------------
  // ABANDON : le joueur qui abandonne perd, l'autre gagne.
  // -----------------------------------------
  function forfeitGame(player: Player) {
    if (gameOver || setupPhase !== 'battle') {
      return;
    }

    const winner: Player = player === 1 ? 2 : 1;

    setForfeitedPlayer(player);
    setGameOver(true);
    setInspectedPokemonCell(null);
    setInspectedHandCard(null);
    setMessage(`🏳️ Le joueur ${player} abandonne. 🏆 Le joueur ${winner} gagne la partie !`);
  }

  // `endTurn` est enveloppé pour ne pas recevoir l'événement de clic en argument.
  function handleEndTurn() {
  if (pendingDiscardTalentPlacement) {
    setMessage("Choisis d'abord une case vide de ton banc pour terminer le Talent.");
    return;
  }

  // Fin du tour : on arrête la consultation des cartes adverses.
  setInspectedPokemonCell(null);
  setInspectedHandCard(null);
  endTurn();
}

  return {
    selectedPokemon,
    inspectedPokemon,
    openedDiscardCards,
    handleToggleDiscard,
    handleCloseDiscardPreview,
    handleDiscardCardPress,
    handleToolPress,
    handleSelectKOEnergy,
    handleSelectInvocation,
    handleSelectAttack,
    handleActivateTalent,
    handleEndTurn,
    discardSummonCandidates,
    selectDiscardSummonCard,
    finishEnergyGather,
    selectEnergyGatherEnergy,
    forfeitGame,
  };
}
