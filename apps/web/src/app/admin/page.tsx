import { AdminOverviewView } from "@/features/admin";
import { StaffHomeView } from "@/features/admin/components/views/StaffHomeView";
import { getServerSession } from "@/features/auth/server/getServerSession";

export const metadata = {
  title: "Tổng quan quản trị | Englow3",
};

export default async function AdminOverviewPage() {
  const session = await getServerSession();
  return session?.role === "STAFF" ? <StaffHomeView /> : <AdminOverviewView />;
}
