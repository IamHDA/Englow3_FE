import type { Metadata } from "next";

import { HomeView } from "@/features/home";

export const metadata: Metadata = {
  title: "Englow3 — Học tiếng Anh, tiến bộ mỗi ngày",
  description:
    "Khám phá lộ trình học tiếng Anh, luyện Writing và Speaking, thi thử IELTS/TOEIC và gia sư AI cùng Englow3.",
};

/** A public introduction that remains available after signing in. */
export default function WelcomePage() {
  return <HomeView />;
}
