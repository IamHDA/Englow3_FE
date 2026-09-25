import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin";
import { getServerSession } from "@/features/auth/server/getServerSession";
import { isBackOfficeRole } from "@/features/auth/types";

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
  // The backend checks every call too; this keeps a learner out of the frame.
  if (!isBackOfficeRole(session?.role)) {
    redirect("/");
  }
  return <AdminShell>{children}</AdminShell>;
}
