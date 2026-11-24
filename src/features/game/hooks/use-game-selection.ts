import {
  canPlacePokemon,
  getFirstPlayableRound,
  getPokemonPlacementKey,
  isPokemonCard,
} from '@/features/game/rules';
import type {
  GameCard,
  Player,
  PokemonCard,
  SetState,
  TrainerCard,
} from '@/features/game/types';

type UseGameSelectionOptions = {
  currentPlayer: Player;
  round: number;
  gameOver: boolean;
  hasPlacedThisTurn: boolean;
  // Didacticiel : pas de restriction de pose selon la manche.
  noPlacementRestrictions?: boolean;
  freeReplacementTokens: Record<string, number>;
  pokemonPlacementLocks: Record<string, number>;
  hasUsedSupporterThisTurn: boolean;
  setMessage: SetState<string>;
  setSelectedCard: SetState<PokemonCard | null>;
  setSelectedTrainerCard: SetState<TrainerCard | null>;
  setSelectedTrainerOwner: SetState<Player | null>;
  setSelectedPokemonCell: SetState<string | null>;
  setSelectedAttackIndex: SetState<number | null>;
  setSelectedAttachedTool: SetState<{
    card: TrainerCard;
    cellName: string;
  } | null>;
  setTrainerEffectActivated: SetState<boolean>;
  setInspectedPokemonCell: SetState<string | null>;
  setInspectedHandCard: SetState<{ card: PokemonCard; owner: Player } | null>;
};

export function useGameSelection({
  currentPlayer,
  round,
  gameOver,
  hasPlacedThisTurn,
  noPlacementRestrictions,
  freeReplacementTokens,
  pokemonPlacementLocks,
  hasUsedSupporterThisTurn,
  setMessage,
  setSelectedCard,
  setSelectedTrainerCard,
  setSelectedTrainerOwner,
  setSelectedPokemonCell,
  setSelectedAttackIndex,
  setSelectedAttachedTool,
  setTrainerEffectActivated,
  setInspectedPokemonCell,
  setInspectedHandCard,
}: UseGameSelectionOptions) {
  function selectCard(card: PokemonCard, owner: Player) {
    if (gameOver) {
      return;
    }

    if (owner !== currentPlayer) {
      setMessage(`C'est au joueur ${currentPlayer} de jouer.`);
      return;
    }

    const placementKey = getPokemonPlacementKey(owner, card.id);

    // Pokémon renvoyé en main par Margie ou Super Rappel.
    const isFreeReplacement = (freeReplacementTokens[placementKey] ?? 0) > 0;

    const lockedUntilRound = pokemonPlacementLocks[placementKey];

    if (lockedUntilRound !== undefined && round <= lockedUntilRound) {
      setMessage(
        card.stage === 'niveau2' && round < lockedUntilRound
          ? `${card.name} est un Niveau 2 renvoyé en main : il pourra être reposé dans 2 tours.`
          : `${card.name} a été renvoyé en main : il pourra être reposé à ton prochain tour.`
      );
      return;
    }

    if (hasPlacedThisTurn && !isFreeReplacement) {
      setMessage('Tu as déjà posé un Pokémon pendant ce tour.');
      return;
    }

    if (!noPlacementRestrictions && !canPlacePokemon(card, round, owner)) {
      const firstRound = getFirstPlayableRound(card, owner);
      const stageLabel =
        card.stage === 'niveau1'
          ? 'un Pokémon Niveau 1'
          : card.stage === 'mega_ex'
            ? 'un Méga Pokémon-ex'
            : 'un Pokémon Niveau 2';

      setMessage(
        `${card.name} est ${stageLabel}. Le joueur ${owner} peut le poser à partir de la manche ${firstRound}.`
      );
      return;
    }

    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
    setSelectedCard(card);
    const row = currentPlayer === 1 ? 'B' : 'C';
    setMessage(
      isFreeReplacement
        ? `${card.name} sélectionné (repose gratuite, sans Énergie). Choisis une case ${row}1 à ${row}4.`
        : `${card.name} sélectionné. Choisis une case ${row}1 à ${row}4.`
    );
  }

  function handleHandCardPress(card: GameCard, owner: Player) {
    if (gameOver) {
      return;
    }

    // Carte de la main adverse : consultation seulement (pas d'utilisation).
    if (owner !== currentPlayer) {
      setSelectedCard(null);
      setSelectedPokemonCell(null);
      setSelectedAttackIndex(null);
      setSelectedAttachedTool(null);
      setInspectedPokemonCell(null);
      setTrainerEffectActivated(false);

      if (isPokemonCard(card)) {
        setSelectedTrainerCard(null);
        setSelectedTrainerOwner(null);
        setInspectedHandCard({ card, owner });
      } else {
        setInspectedHandCard(null);
        setSelectedTrainerCard(card);
        setSelectedTrainerOwner(owner);
      }

      setMessage(`${card.name} : carte du joueur ${owner}, consultation seulement.`);
      return;
    }

    // Carte de sa propre main : fin de la consultation éventuelle.
    setInspectedPokemonCell(null);
    setInspectedHandCard(null);

    if (
      !isPokemonCard(card) &&
      card.category === 'supporter' &&
      hasUsedSupporterThisTurn
    ) {
      setMessage('Tu as déjà utilisé une carte Supporter pendant ce tour.');
      return;
    }

    if (isPokemonCard(card)) {
      setSelectedTrainerCard(null);
      setSelectedTrainerOwner(null);
      setTrainerEffectActivated(false);
      selectCard(card, owner);
      return;
    }

    setSelectedCard(null);
    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
    setSelectedTrainerCard(card);
    setSelectedTrainerOwner(owner);
    setTrainerEffectActivated(false);

    if (card.effect === 'heal30' || card.effect === 'heal20') {
      setMessage(
        `${card.name} sélectionnée. Choisis maintenant un de tes Pokémon à soigner.`
      );
    } else {
      setMessage(`${card.name} : son effet n'est pas encore programmé.`);
    }
  }

  return { handleHandCardPress, selectCard };
}
