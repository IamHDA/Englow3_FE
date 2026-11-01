import {
  AdjustmentReason,
  RoadmapContentKind,
} from "@/lib/graphql/generated/schemaTypes";

type Words = { vi: string; en: string };

/** Where each kind of scheduled content is practised. */
export function contentHref(
  kind: RoadmapContentKind,
  contentId: string,
  skill: string | null | undefined,
): string {
  switch (kind) {
    case RoadmapContentKind.FLASHCARD_SET:
      return `/study/flashcards/${contentId}/study`;
    case RoadmapContentKind.DICTATION_LESSON:
      return `/study/dictation/${contentId}`;
    case RoadmapContentKind.QUIZ:
      return `/study/quiz/${contentId}`;
    case RoadmapContentKind.SPEAKING_PROMPT:
      return `/study/pronunciation/${contentId}`;
    case RoadmapContentKind.ASSESSMENT_TASK:
      return skill === "WRITING"
        ? `/study/writing/${contentId}`
        : `/study/speaking/${contentId}`;
  }
}

export const CONTENT_KIND_LABELS: Record<RoadmapContentKind, Words> = {
  [RoadmapContentKind.FLASHCARD_SET]: { vi: "Thẻ từ", en: "Flashcards" },
  [RoadmapContentKind.DICTATION_LESSON]: { vi: "Nghe chép", en: "Dictation" },
  [RoadmapContentKind.QUIZ]: { vi: "Trắc nghiệm", en: "Quiz" },
  [RoadmapContentKind.SPEAKING_PROMPT]: { vi: "Phát âm", en: "Pronunciation" },
  [RoadmapContentKind.ASSESSMENT_TASK]: {
    vi: "Viết / Nói",
    en: "Writing / Speaking",
  },
};

export const ADJUSTMENT_LABELS: Record<AdjustmentReason, Words> = {
  [AdjustmentReason.MILESTONE_PASSED]: {
    vi: "Đạt mốc, sang giai đoạn sau",
    en: "Milestone passed, next stage",
  },
  [AdjustmentReason.MILESTONE_FAILED]: {
    vi: "Chưa đạt mốc, thêm bài cho phần yếu",
    en: "Milestone missed, more practice added",
  },
  [AdjustmentReason.BEHIND_SCHEDULE]: {
    vi: "Chậm hơn kế hoạch, sắp xếp lại",
    en: "Behind schedule, replanned",
  },
  [AdjustmentReason.AHEAD_OF_SCHEDULE]: {
    vi: "Nhanh hơn kế hoạch",
    en: "Ahead of schedule",
  },
  [AdjustmentReason.GOAL_CHANGED]: {
    vi: "Mục tiêu thay đổi",
    en: "Goal changed",
  },
  [AdjustmentReason.LEVEL_REASSESSED]: {
    vi: "Đo lại trình độ",
    en: "Level measured again",
  },
};

/** Backend refusals with a stable code, in words a learner can act on. */
export const ROADMAP_ERROR_MESSAGES: Record<string, Words> = {
  ROADMAP_LEVEL_UNKNOWN: {
    vi: "Hệ thống chưa biết trình độ hiện tại của bạn. Hãy hoàn tất bước trình độ trong phần thiết lập.",
    en: "Your current level is not known yet. Finish the level step of your setup first.",
  },
  ROADMAP_GOAL_INCOMPLETE: {
    vi: "Bạn chưa đặt mục tiêu (điểm chứng chỉ hoặc trình độ muốn đạt). Hãy cập nhật mục tiêu trước.",
    en: "Set your goal (a certificate score or a target level) first.",
  },
  ROADMAP_NO_CONTENT: {
    vi: "Chưa đủ bài học đã xuất bản để lập lộ trình cho mục tiêu này. Vui lòng thử lại sau.",
    en: "There is not enough published content to plan this goal yet. Try again later.",
  },
  ROADMAP_DAILY_LIMIT: {
    vi: "Lộ trình đã được tạo lại nhiều lần hôm nay. Vui lòng thử lại vào ngày mai.",
    en: "The roadmap was rebuilt too often today. Try again tomorrow.",
  },
  ROADMAP_GENERATING: {
    vi: "Lộ trình của bạn đang được tạo.",
    en: "Your roadmap is still being made.",
  },
  LEVEL_CHECK_PAPER_NOT_FOUND: {
    vi: "Bài đo trình độ chưa sẵn sàng. Vui lòng thử lại sau.",
    en: "The level test is not ready yet. Try again later.",
  },
};

export const GENERIC_ROADMAP_ERROR: Words = {
  vi: "Không thực hiện được. Vui lòng thử lại.",
  en: "That did not work. Please try again.",
};
