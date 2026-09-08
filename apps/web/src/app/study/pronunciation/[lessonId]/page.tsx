import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MOCK_PRONUNCIATION_LESSONS,
  PronunciationPracticeView,
} from "@/features/pronunciation";

interface LessonPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = MOCK_PRONUNCIATION_LESSONS.find(
    (l) => l.id === lessonId || l.slug === lessonId
  );

  if (!lesson) {
    return {
      title: "Không tìm thấy bài học | Englow3",
    };
  }

  return {
    title: `${lesson.title} | Luyện phát âm AI Englow3`,
    description: `Luyện phát âm chuẩn AI âm ${lesson.phonemeTarget} với câu: "${lesson.targetSentence}"`,
  };
}

export default async function PronunciationLessonPage({
  params,
}: LessonPageProps) {
  const { lessonId } = await params;
  const lesson = MOCK_PRONUNCIATION_LESSONS.find(
    (l) => l.id === lessonId || l.slug === lessonId
  );

  if (!lesson) {
    notFound();
  }

  return <PronunciationPracticeView lesson={lesson} />;
}
