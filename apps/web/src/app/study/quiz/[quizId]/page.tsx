import type { Metadata } from "next";
import { QuizSittingView } from "@/features/quiz";

interface QuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

/**
 * Tiêu đề chung thay vì tên bài: tên nằm sau một lượt gọi BFF có xác thực, mà
 * metadata chạy phía server trước khi biết người dùng là ai.
 */
export const metadata: Metadata = {
  title: "Bài kiểm tra | Englow3",
  description: "Làm bài kiểm tra từ vựng, ngữ pháp và đọc hiểu trên Englow3.",
};

export default async function QuizSittingPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  return <QuizSittingView quizId={quizId} />;
}
