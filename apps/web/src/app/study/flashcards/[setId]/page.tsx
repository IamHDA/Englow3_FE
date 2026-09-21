import type { Metadata } from "next";
import { FlashcardSetDetailView } from "@/features/flashcard";

interface SetDetailPageProps {
  params: Promise<{
    setId: string;
  }>;
}

/**
 * Tiêu đề trang không lấy tên bộ thẻ nữa: tên nằm sau một lượt gọi BFF có xác
 * thực, mà metadata chạy phía server trước khi biết người dùng là ai. Đổi lại
 * là một tiêu đề chung, thay vì một lượt gọi thứ hai chỉ để lấy cái tên.
 */
export const metadata: Metadata = {
  title: "Bộ thẻ ghi nhớ | Englow3",
  description:
    "Xem danh sách từ vựng trong bộ thẻ và bắt đầu phiên học theo chu kỳ lặp lại ngắt quãng.",
};

export default async function FlashcardSetPage({ params }: SetDetailPageProps) {
  const { setId } = await params;
  return <FlashcardSetDetailView setId={setId} />;
}
