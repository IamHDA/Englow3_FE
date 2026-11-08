import {
  FULL_TEST_SITTING_PARAM,
  readFullTestSitting,
} from "@/shared/constants/fullTestNavigation";
import { AssessmentAttemptView } from "@/features/assessment/components/AssessmentAttemptView";
export const metadata = { title: "Bài luyện và kết quả | Englow3" };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const fullTestSittingId = readFullTestSitting(
    (await searchParams)[FULL_TEST_SITTING_PARAM],
  );
  return (
    <AssessmentAttemptView id={id} fullTestSittingId={fullTestSittingId} />
  );
}
