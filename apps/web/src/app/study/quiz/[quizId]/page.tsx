import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCK_QUIZZES, QuizSittingView } from "@/features/quiz";

interface QuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export async function generateMetadata({
  params,
}: QuizPageProps): Promise<Metadata> {
  const { quizId } = await params;
  const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);

  if (!quiz) {
    return {
      title: "Không tìm thấy bài kiểm tra | Englow3",
    };
  }

  return {
    title: `${quiz.title} | Englow3 Quiz`,
    description: quiz.description,
  };
}

export default async function QuizSittingPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);

  if (!quiz) {
    notFound();
  }

  return <QuizSittingView quiz={quiz} />;
}
