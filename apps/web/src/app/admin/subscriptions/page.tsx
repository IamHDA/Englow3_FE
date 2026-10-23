import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminSubscriptionsView } from "@/features/admin";
import { getServerSession } from "@/features/auth/server/getServerSession";

export const metadata: Metadata = {
  title: "Gói dịch vụ | Englow3",
  description: "Cấp hoặc thu hồi gói Pro cho học viên.",
};

export default async function AdminSubscriptionsPage() {
  const session = await getServerSession();
  // Staff may enter the administration area, but changing a plan is the
  // administrator's alone; the backend refuses anyone else too.
  if (session?.role !== "ADMIN") redirect("/admin");
  return <AdminSubscriptionsView />;
}
