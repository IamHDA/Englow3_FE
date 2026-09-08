import type { Metadata } from "next";
import { DailyPathView } from "@/features/quiz";

export const metadata: Metadata = {
  title: "Lộ trình học tập mỗi ngày | Englow3",
  description:
    "Lộ trình học thích ứng thông minh theo chu kỳ kiến thức, vượt qua các cột mốc thử thách và tích lũy điểm kinh nghiệm mỗi ngày.",
};

interface DailyPathPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function DailyPathPage({ searchParams }: DailyPathPageProps) {
  const { tab } = await searchParams;
  const initialTab = tab === "quizzes" ? "quizzes" : "roadmap";

  return <DailyPathView initialTab={initialTab} />;
}
