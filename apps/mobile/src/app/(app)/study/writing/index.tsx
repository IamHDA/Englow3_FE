import { AssessmentCatalog } from "@/features/assessment/AssessmentCatalog";
import { AssessmentSkill } from "@/lib/graphql/generated";

export default function WritingCatalogScreen() {
  return <AssessmentCatalog skill={AssessmentSkill.WRITING} />;
}
