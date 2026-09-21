import type { Metadata } from "next";
import { DictationPracticeView } from "@/features/dictation";

interface DictationLessonPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

/**
 * Tiêu đề chung thay vì tên bài: tên nằm sau một lượt gọi BFF có xác thực, mà
 * metadata chạy phía server trước khi biết người dùng là ai.
 */
export const metadata: Metadata = {
  title: "Luyện nghe chép | Englow3",
  description:
    "Nghe và chép lại từng câu, nhận điểm chính xác theo từng từ sau khi nộp.",
};

export default async function DictationLessonPage({
  params,
}: DictationLessonPageProps) {
  const { lessonId } = await params;
  return <DictationPracticeView lessonId={lessonId} />;
}
