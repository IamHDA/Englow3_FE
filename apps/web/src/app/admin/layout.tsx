import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin";
import { getServerSession } from "@/features/auth/server/getServerSession";

/** Who may enter the administration area. The backend checks every call too. */
const ADMIN_AREA_ROLES = new Set(["ADMIN", "STAFF"]);

/**
 * The administration area. A learner who types /admin is sent home before any
 * of it renders, rather than shown a frame whose every request answers 403.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();
  if (!session?.role || !ADMIN_AREA_ROLES.has(session.role)) {
    redirect("/");
  }
  return <AdminShell>{children}</AdminShell>;
}
