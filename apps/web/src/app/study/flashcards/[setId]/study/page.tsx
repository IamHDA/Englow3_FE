import type { Metadata } from "next";
import { FlashcardStudyView } from "@/features/flashcard";

interface FlashcardStudyPageProps {
  params: Promise<{
    setId: string;
  }>;
}

export const metadata: Metadata = {
  title: "Học bộ thẻ | Englow3",
  description: "Luyện tập bộ thẻ ghi nhớ theo chu kỳ lặp lại ngắt quãng SRS.",
};

export default async function FlashcardStudyPage({
  params,
}: FlashcardStudyPageProps) {
  const { setId } = await params;
  return <FlashcardStudyView setId={setId} />;
}
