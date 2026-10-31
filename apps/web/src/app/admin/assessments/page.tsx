import { AssessmentManagement } from "@/features/assessment/components/AssessmentManagement";
export const metadata = { title: "Quản lý Writing & Speaking | Englow3" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <AssessmentManagement initial={await searchParams} />;
}
