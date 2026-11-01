import type { Metadata } from "next";
import { DailyPathView } from "@/features/quiz";

export const metadata: Metadata = {
  title: "Việc cần làm hôm nay | Englow3",
  description:
    "Những bài nên làm hôm nay, lấy từ giai đoạn hiện tại trong lộ trình của bạn, cùng chuỗi ngày học và nhiệm vụ trong ngày.",
};

interface DailyPathPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function DailyPathPage({
  searchParams,
}: DailyPathPageProps) {
  const { tab } = await searchParams;
  const initialTab = tab === "quizzes" ? "quizzes" : "roadmap";

  return <DailyPathView initialTab={initialTab} />;
}
