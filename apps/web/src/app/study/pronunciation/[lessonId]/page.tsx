import type { Metadata } from "next";

import { PronunciationPracticeView } from "@/features/pronunciation";

interface PromptPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

/**
 * Tiêu đề chung, không phải tên câu luyện.
 *
 * Trước đây nó tra trong file dữ liệu giả để đặt tiêu đề theo bài. Muốn giữ
 * được điều đó với dữ liệu thật thì phải gọi backend ngay trong
 * `generateMetadata`, mà lời gọi đó cần token của người dùng - thứ một trang
 * dựng phía server chưa có. Tiêu đề chung là đúng hơn một tiêu đề bịa.
 */
export const metadata: Metadata = {
  title: "Luyện phát âm | Englow",
};

export default async function PronunciationPromptPage({
  params,
}: PromptPageProps) {
  const { lessonId } = await params;

  return <PronunciationPracticeView promptId={lessonId} />;
}
