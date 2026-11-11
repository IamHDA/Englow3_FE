import { redirect } from "next/navigation";
import { getServerSession } from "@/features/auth/server/getServerSession";
import { AdminUsersView } from "@/features/admin/components/views/AdminUsersView";
export const metadata = { title: "Người dùng & phân quyền | Englow3" };
export default async function AdminUsersPage() {
  if ((await getServerSession())?.role !== "ADMIN") redirect("/admin");
  return <AdminUsersView />;
}
