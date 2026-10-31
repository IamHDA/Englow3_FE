import type { Metadata } from "next";
import { FlashcardDashboardView } from "@/features/flashcard";
import { flashcardFiltersFromUrl } from "@/features/flashcard/catalogueFilters";

export const metadata: Metadata = {
  title: "Thẻ ghi nhớ từ vựng 3D | Englow3",
  description:
    "Học từ vựng tiếng Anh theo phương pháp lặp lại ngắt quãng (Spaced Repetition System) với hiệu ứng lật thẻ 3D trực quan.",
};

interface FlashcardPageProps {
  searchParams: Promise<{
    tab?: string | string[];
    topic?: string | string[];
    q?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
}

export default async function FlashcardPage({
  searchParams,
}: FlashcardPageProps) {
  const values = await searchParams;
  const { tab } = values;
  const initialTab = tab === "stats" ? "stats" : "decks";

  return (
    <FlashcardDashboardView
      initialTab={initialTab}
      initialFilters={flashcardFiltersFromUrl(values)}
    />
  );
}
