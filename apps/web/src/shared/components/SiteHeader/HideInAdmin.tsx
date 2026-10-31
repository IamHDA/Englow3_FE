"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The learner header, everywhere except the administration area, which has a
 * frame of its own. A client wrapper so the header itself can stay a Server
 * Component: it is passed in as children, already rendered.
 */
export function HideInAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return children;
}
