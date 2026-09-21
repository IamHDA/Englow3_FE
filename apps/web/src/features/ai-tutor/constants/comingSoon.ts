import { BookOpenCheck, MessagesSquare, Mic, PenLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PlannedCapability = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/**
 * Những gì gia sư AI sẽ làm khi mở. Là lời giới thiệu, không phải cam kết ngày
 * ra mắt - backend đã gỡ toàn bộ phần AI khỏi codebase nên chưa có endpoint nào
 * đứng sau các mục này.
 */
export const PLANNED_CAPABILITIES: readonly PlannedCapability[] = [
  {
    icon: MessagesSquare,
    title: "Hội thoại luyện tập",
    description:
      "Trò chuyện theo chủ đề và trình độ của bạn, sửa lỗi ngay trong mạch nói.",
  },
  {
    icon: Mic,
    title: "Chấm phát âm",
    description:
      "Đọc to một đoạn và nhận nhận xét theo từng âm, kèm mẫu đối chiếu.",
  },
  {
    icon: PenLine,
    title: "Chữa bài viết",
    description:
      "Gửi bài Writing và nhận nhận xét theo từng tiêu chí chấm của IELTS, TOEIC.",
  },
  {
    icon: BookOpenCheck,
    title: "Giải thích đáp án",
    description:
      "Hỏi lại vì sao một câu trong đề thi thử lại sai, thay vì chỉ đọc đáp án.",
  },
];
