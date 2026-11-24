import { TutorialCourseScreen } from '@/features/tutorial/tutorial-screen';
import { BASE_COURSE } from '@/features/tutorial/tutorial-steps';

export default function BaseTutorialRoute() {
  return <TutorialCourseScreen course={BASE_COURSE} />;
}
