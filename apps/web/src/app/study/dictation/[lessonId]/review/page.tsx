import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DictationReviewView, MOCK_LESSONS } from "@/features/dictation";

interface DictationReviewPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

export async function generateMetadata({
  params,
}: DictationReviewPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson =
    MOCK_LESSONS.find((l) => l.slug === lessonId || l.id === lessonId) ||
    MOCK_LESSONS[0];

  return {
    title: `Ôn tập câu sai — ${lesson.title} | Englow3`,
    description: `Luyện lại riêng những câu sai trong bài học ${lesson.title} để nắm vững từ vựng và ngữ pháp.`,
  };
}

export default async function DictationReviewPage({
  params,
}: DictationReviewPageProps) {
  const { lessonId } = await params;
  const lesson =
    MOCK_LESSONS.find((l) => l.slug === lessonId || l.id === lessonId) ||
    MOCK_LESSONS[0];

  if (!lesson) {
    notFound();
  }

  return <DictationReviewView lessonTitle={lesson.title} />;
}
