import { useLocalSearchParams } from "expo-router";

import { AssessmentTaskScreen } from "@/features/assessment/AssessmentTaskScreen";
import { isFullTestSlot } from "@/features/fullTest/labels";

export default function SpeakingTaskScreen() {
  const { id, fullTestSitting, slot } = useLocalSearchParams<{
    id: string;
    fullTestSitting?: string;
    slot?: string;
  }>();
  return (
    <AssessmentTaskScreen
      id={id}
      fullTest={
        fullTestSitting && isFullTestSlot(slot)
          ? { sittingId: fullTestSitting, slot }
          : null
      }
    />
  );
}
