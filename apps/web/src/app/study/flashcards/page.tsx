import type { Metadata } from "next";
import { FlashcardDashboardView } from "@/features/flashcard";

export const metadata: Metadata = {
  title: "Thẻ ghi nhớ từ vựng 3D | Englow3",
  description:
    "Học từ vựng tiếng Anh theo phương pháp lặp lại ngắt quãng (Spaced Repetition System) với hiệu ứng lật thẻ 3D trực quan.",
};

interface FlashcardPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function FlashcardPage({ searchParams }: FlashcardPageProps) {
  const { tab } = await searchParams;
  const initialTab = tab === "stats" ? "stats" : "decks";

  return <FlashcardDashboardView initialTab={initialTab} />;
}
