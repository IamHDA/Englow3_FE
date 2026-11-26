import type { Href } from "expo-router";

import { AdjustmentReason, RoadmapContentKind } from "@/lib/graphql/generated";

/** Same destinations as the web's contentHref (apps/web/src/features/roadmap/constants/roadmap.ts). */
export function contentHref(
  kind: RoadmapContentKind,
  contentId: string,
  skill: string | null | undefined,
): Href {
  switch (kind) {
    case RoadmapContentKind.FLASHCARD_SET:
      return {
        pathname: "/study/flashcards/[setId]/study",
        params: { setId: contentId },
      };
    case RoadmapContentKind.DICTATION_LESSON:
      return {
        pathname: "/study/dictation/[lessonId]",
        params: { lessonId: contentId },
      };
    case RoadmapContentKind.QUIZ:
      return {
        pathname: "/study/quiz/[quizId]",
        params: { quizId: contentId },
      };
    case RoadmapContentKind.SPEAKING_PROMPT:
      return {
        pathname: "/study/pronunciation/[lessonId]",
        params: { lessonId: contentId },
      };
    case RoadmapContentKind.ASSESSMENT_TASK:
      return skill === "WRITING"
        ? { pathname: "/study/writing/[id]", params: { id: contentId } }
        : { pathname: "/study/speaking/[id]", params: { id: contentId } };
  }
}

export const CONTENT_KIND_LABELS: Record<RoadmapContentKind, string> = {
  [RoadmapContentKind.FLASHCARD_SET]: "Thẻ từ",
  [RoadmapContentKind.DICTATION_LESSON]: "Nghe chép",
  [RoadmapContentKind.QUIZ]: "Trắc nghiệm",
  [RoadmapContentKind.SPEAKING_PROMPT]: "Phát âm",
  [RoadmapContentKind.ASSESSMENT_TASK]: "Viết / Nói",
};

export const ADJUSTMENT_LABELS: Record<AdjustmentReason, string> = {
  [AdjustmentReason.MILESTONE_PASSED]: "Đạt mốc, sang giai đoạn sau",
  [AdjustmentReason.MILESTONE_FAILED]: "Chưa đạt mốc, thêm bài cho phần yếu",
  [AdjustmentReason.BEHIND_SCHEDULE]: "Chậm hơn kế hoạch, sắp xếp lại",
  [AdjustmentReason.AHEAD_OF_SCHEDULE]: "Nhanh hơn kế hoạch",
  [AdjustmentReason.GOAL_CHANGED]: "Mục tiêu thay đổi",
  [AdjustmentReason.LEVEL_REASSESSED]: "Đo lại trình độ",
};

export const ROADMAP_ERRORS: Record<string, string> = {
  MILESTONE_SITTING_ALREADY_USED:
    "Lượt thi này đã dùng để vượt mốc trước. Hãy làm lượt thi mới cho mốc hiện tại.",
  ROADMAP_SCORE_CONFIGURATION_REQUIRED:
    "Chưa có bảng quy đổi TOEIC đã kiểm duyệt để tạo mốc lộ trình. Bạn có thể tự luyện trong thư viện trong lúc chờ.",
  ROADMAP_LEVEL_UNKNOWN:
    "Hệ thống chưa biết trình độ hiện tại của bạn. Hãy hoàn tất bước trình độ trong phần thiết lập.",
  ROADMAP_GOAL_INCOMPLETE:
    "Bạn chưa đặt mục tiêu (điểm chứng chỉ hoặc trình độ muốn đạt). Hãy cập nhật mục tiêu trước.",
  ROADMAP_NO_CONTENT:
    "Chưa đủ bài học đã xuất bản để lập lộ trình cho mục tiêu này. Vui lòng thử lại sau.",
  ROADMAP_DAILY_LIMIT:
    "Lộ trình đã được tạo lại nhiều lần hôm nay. Vui lòng thử lại vào ngày mai.",
  ROADMAP_GENERATING: "Lộ trình của bạn đang được tạo.",
  LEVEL_CHECK_PAPER_NOT_FOUND:
    "Bài đo trình độ chưa sẵn sàng. Vui lòng thử lại sau.",
};
