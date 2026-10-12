import { canPlacePokemon, isPokemonCard } from '@/features/game/rules';
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
};

export function useGameSelection({
  currentPlayer,
  round,
  gameOver,
  hasPlacedThisTurn,
  hasUsedSupporterThisTurn,
  setMessage,
  setSelectedCard,
  setSelectedTrainerCard,
  setSelectedTrainerOwner,
  setSelectedPokemonCell,
  setSelectedAttackIndex,
  setSelectedAttachedTool,
  setTrainerEffectActivated,
}: UseGameSelectionOptions) {
  function selectCard(card: PokemonCard, owner: Player) {
    if (gameOver) {
      return;
    }

    if (owner !== currentPlayer) {
      setMessage(`C'est au joueur ${currentPlayer} de jouer.`);
      return;
    }

    if (hasPlacedThisTurn) {
      setMessage('Tu as déjà posé un Pokémon pendant ce tour.');
      return;
    }

    if (!canPlacePokemon(card, round)) {
      if (card.stage === 'niveau1') {
        setMessage(
          `${card.name} est un Pokémon Niveau 1. Il peut être posé à partir de la manche 2.`
        );
      } else if (card.stage === 'mega_ex') {
        setMessage(
          `${card.name} est un Méga Pokémon-ex. Il peut être posé à partir de la manche 2.`
        );
      } else if (card.stage === 'niveau2') {
        setMessage(
          `${card.name} est un Pokémon Niveau 2. Il peut être posé à partir de la manche 3.`
        );
      }
      return;
    }

    setSelectedPokemonCell(null);
    setSelectedAttackIndex(null);
    setSelectedCard(card);
    const row = currentPlayer === 1 ? 'B' : 'C';
    setMessage(`${card.name} sélectionné. Choisis une case ${row}1 à ${row}4.`);
  }

  function handleHandCardPress(card: GameCard, owner: Player) {
    if (gameOver) {
      return;
    }

    if (owner !== currentPlayer) {
      if (!isPokemonCard(card) && card.effect === 'summonTwoBase60') {
        setSelectedCard(null);
        setSelectedPokemonCell(null);
        setSelectedAttackIndex(null);
        setSelectedAttachedTool(null);
        setSelectedTrainerCard(card);
        setSelectedTrainerOwner(owner);
        setTrainerEffectActivated(false);
        setMessage(
          `Invocation Duo du joueur ${owner}. Tu peux consulter ses Invocations, mais pas activer la carte.`
        );
        return;
      }

      setMessage(`C'est au joueur ${currentPlayer} de jouer.`);
      return;
    }

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
