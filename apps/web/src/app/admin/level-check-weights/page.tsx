import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLevelCheckWeightsView } from "@/features/admin";
import { getServerSession } from "@/features/auth/server/getServerSession";

export const metadata: Metadata = {
  title: "Trọng số bài đo trình độ | Englow3",
  description: "Xem và đổi trọng số ghép các phần của bài đo trình độ.",
};

export default async function AdminLevelCheckWeightsPage() {
  const session = await getServerSession();
  // Staff may enter the administration area, but how learners are placed is
  // the administrator's alone; the backend refuses anyone else too.
  if (session?.role !== "ADMIN") redirect("/admin");
  return <AdminLevelCheckWeightsView />;
}
