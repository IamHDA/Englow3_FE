import type { Metadata } from "next";

import { LevelCheckView } from "@/features/roadmap";

export const metadata: Metadata = {
  title: "Bài đo trình độ | Englow3",
};

export default function LevelCheckPage() {
  return <LevelCheckView />;
}
