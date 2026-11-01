import type { Metadata } from "next";

import { RoadmapView } from "@/features/roadmap";

export const metadata: Metadata = {
  title: "Lộ trình học | Englow3",
  description:
    "Lộ trình tới mục tiêu của bạn: các giai đoạn, bài cần làm và bài kiểm tra cuối mỗi giai đoạn.",
};

export default function RoadmapPage() {
  return <RoadmapView />;
}
