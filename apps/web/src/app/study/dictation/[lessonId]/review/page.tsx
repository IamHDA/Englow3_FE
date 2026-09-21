import type { Metadata } from "next";
import { DictationReviewView } from "@/features/dictation";

interface DictationReviewPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

export const metadata: Metadata = {
  title: "Ôn tập câu sai | Englow3",
  description:
    "Luyện lại riêng những câu đã chép sai để nắm vững từ vựng và ngữ pháp.",
};

/**
 * Màn này vẫn chạy dữ liệu giả: chưa có endpoint "những câu tôi hay sai". Khi
 * có, nó sẽ nhận lessonId và tự đi lấy như hai màn kia.
 */
export default async function DictationReviewPage({
  params,
}: DictationReviewPageProps) {
  await params;
  return <DictationReviewView lessonTitle="" />;
}
