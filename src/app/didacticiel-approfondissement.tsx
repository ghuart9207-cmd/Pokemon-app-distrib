import { ADVANCED_COURSE } from '@/features/tutorial/tutorial-advanced';
import { TutorialCourseScreen } from '@/features/tutorial/tutorial-screen';

export default function AdvancedTutorialRoute() {
  return <TutorialCourseScreen course={ADVANCED_COURSE} />;
}
