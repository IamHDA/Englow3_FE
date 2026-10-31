import { AssessmentTaskView } from "@/features/assessment/components/AssessmentTaskView";
export const metadata = { title: "Đề luyện Writing | Englow3" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssessmentTaskView id={id} />;
}
