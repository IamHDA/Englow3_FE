import { AssessmentLibrary } from "@/features/assessment/components/AssessmentLibrary";
import { AssessmentSkill } from "@/lib/graphql/generated";
export const metadata = { title: "Luyện Writing | Englow3" };
export default function Page() {
  return <AssessmentLibrary skill={AssessmentSkill.WRITING} />;
}
