import { AssessmentAttemptView } from "@/features/assessment/components/AssessmentAttemptView";
export const metadata = { title: "Bài luyện và kết quả | Englow3" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssessmentAttemptView id={id} />;
}
