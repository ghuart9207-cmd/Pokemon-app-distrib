import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useGame } from '@/features/game/hooks/use-game';
import { GameView } from '@/features/game/screens/game-view';
import { COLORS } from '@/features/ui/theme';

import type { TutorialCourse } from './tutorial-steps';
import { useTutorial } from './use-tutorial';

/**
 * Didacticiel guidé (étape 1 « Base du jeu » ou étape 2 « Approfondissement »).
 * Le joueur suit les instructions (joueur 1), l'adversaire joue tout seul (joueur 2).
 * À la fin, retour au menu du didacticiel.
 */
export function TutorialCourseScreen({ course }: { course: TutorialCourse }) {
  const router = useRouter();
  const rawGame = useGame(course.series);
  const { game, panel } = useTutorial(rawGame, course, () =>
    router.canGoBack() ? router.back() : router.replace('/didacticiel')
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GameView game={game} tutorial={panel} />
    </View>
  );
}
