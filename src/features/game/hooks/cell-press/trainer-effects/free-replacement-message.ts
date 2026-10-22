import type { ReturnToHandReplacement, Stage } from '@/features/game/types';

/** Message affiché quand une carte renvoie un Pokémon en main. */
export function getFreeReplacementMessage(
  name: string,
  stage: Stage,
  mode: ReturnToHandReplacement = 'free'
): string {
  const when =
    stage === 'niveau1'
      ? 'à partir de ton prochain tour'
      : stage === 'niveau2'
        ? 'dans 2 tours'
        : 'dès maintenant';

  if (mode === 'normal') {
    return ` ${name} pourra être reposé ${when}, comme pose normale du tour.`;
  }

  return ` ${name} pourra être reposé ${when}, en plus de la pose du tour, mais sans Énergie.`;
}
