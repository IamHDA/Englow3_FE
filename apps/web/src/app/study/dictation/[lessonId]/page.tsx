import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DictationPracticeView, MOCK_LESSONS } from "@/features/dictation";

interface DictationPracticePageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

export async function generateMetadata({
  params,
}: DictationPracticePageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson =
    MOCK_LESSONS.find((l) => l.slug === lessonId || l.id === lessonId) ||
    MOCK_LESSONS[0];

  return {
    title: `${lesson.title} — Luyện nghe chính tả | Englow3`,
    description: `Thực hành nghe và gõ chính tả bài học ${lesson.title} (${lesson.level}) với ${lesson.sentenceCount} câu luyện tập.`,
  };
}

export default async function DictationPracticePage({
  params,
}: DictationPracticePageProps) {
  const { lessonId } = await params;
  const lesson =
    MOCK_LESSONS.find((l) => l.slug === lessonId || l.id === lessonId) ||
    MOCK_LESSONS[0];

  if (!lesson) {
    notFound();
  }

  return <DictationPracticeView lesson={lesson} />;
}
