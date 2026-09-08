import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FlashcardSetDetailView,
  MOCK_FLASHCARD_SETS,
} from "@/features/flashcard";

interface SetDetailPageProps {
  params: Promise<{
    setId: string;
  }>;
}

export async function generateMetadata({
  params,
}: SetDetailPageProps): Promise<Metadata> {
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
    title: `${set.name} | Englow3 Flashcards`,
    description: set.description,
  };
}

export default async function FlashcardSetPage({
  params,
}: SetDetailPageProps) {
  const { setId } = await params;
  const set = MOCK_FLASHCARD_SETS.find(
    (s) => s.id === setId || s.slug === setId
  );

  if (!set) {
    notFound();
  }

  return <FlashcardSetDetailView set={set} />;
}
