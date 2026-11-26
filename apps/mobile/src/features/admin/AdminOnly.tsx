import { Redirect } from "expo-router";
import type { ReactNode } from "react";

import { useAuth } from "@/features/auth/AuthProvider";

/** Screens the web keeps to administrators; staff go back to the hub. The backend checks too. */
export function AdminOnly({ children }: { children: ReactNode }) {
  const { me } = useAuth();
  if (me?.role !== "ADMIN") return <Redirect href="/admin" />;
  return <>{children}</>;
}
