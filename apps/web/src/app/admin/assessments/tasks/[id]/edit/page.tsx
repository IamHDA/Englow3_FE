import { AssessmentEditorPage } from "@/features/assessment/components/AssessmentEditorPage";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssessmentEditorPage mode="edit" id={id} />;
}
