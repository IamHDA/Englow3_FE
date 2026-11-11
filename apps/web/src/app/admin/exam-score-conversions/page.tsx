import { redirect } from "next/navigation";
import { getServerSession } from "@/features/auth/server/getServerSession";
import { AdminScoreConversionsView } from "@/features/exam/components/views/AdminScoreConversionsView";
export const metadata = { title: "Quy đổi điểm | Englow3" };
export default async function ScoreConversionsPage() {
  if ((await getServerSession())?.role !== "ADMIN") redirect("/admin");
  return <AdminScoreConversionsView />;
}
