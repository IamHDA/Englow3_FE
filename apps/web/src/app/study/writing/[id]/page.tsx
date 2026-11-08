import {
  FULL_TEST_SITTING_PARAM,
  readFullTestSitting,
} from "@/shared/constants/fullTestNavigation";
import { AssessmentTaskView } from "@/features/assessment/components/AssessmentTaskView";
export const metadata = { title: "Đề luyện Writing | Englow3" };
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
  return <AssessmentTaskView id={id} fullTestSittingId={fullTestSittingId} />;
}
