import { withFullTestSitting } from "@/shared/constants/fullTestNavigation";
export {
  FULL_TEST_SITTING_PARAM,
  fullTestSittingPath,
} from "@/shared/constants/fullTestNavigation";

export const paperForFullTestPath = (examId: string, sittingId: string) =>
  withFullTestSitting(`/exams/${examId}`, sittingId);
