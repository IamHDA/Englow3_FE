import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FlashcardStudyView,
  MOCK_FLASHCARD_SETS,
} from "@/features/flashcard";

interface FlashcardStudyPageProps {
  params: Promise<{
    setId: string;
  }>;
}

export async function generateMetadata({
  params,
}: FlashcardStudyPageProps): Promise<Metadata> {
  const { setId } = await params;
  const set = MOCK_FLASHCARD_SETS.find(
    (s) => s.id === setId || s.slug === setId
  );

  if (!set) {
    return {
      title: "Không tìm thấy bộ thẻ | Englow3",
    };
  }

  return {
    title: `Học ${set.name} | Englow3 Flashcards`,
    description: `Luyện tập bộ thẻ ghi nhớ ${set.name} theo chu kỳ lặp lại ngắt quãng SRS.`,
  };
}

export default async function FlashcardStudyPage({
  params,
}: FlashcardStudyPageProps) {
  const { setId } = await params;
  const set = MOCK_FLASHCARD_SETS.find(
    (s) => s.id === setId || s.slug === setId
  );

  if (!set) {
    notFound();
  }

  return <FlashcardStudyView set={set} />;
}
