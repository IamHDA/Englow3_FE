import { AssessmentCatalog } from "@/features/assessment/AssessmentCatalog";
import { AssessmentSkill } from "@/lib/graphql/generated";

export default function SpeakingCatalogScreen() {
  return <AssessmentCatalog skill={AssessmentSkill.SPEAKING} />;
}
