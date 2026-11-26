import type { Href } from "expo-router";

import { DailyQuestKind, DailyTaskKind } from "@/lib/graphql/generated";
import type { IconName } from "@/ui/components";

/** Mirrors apps/web/src/features/quiz/constants/dailyPath.ts; the routes are the web's paths. */
export const TASK_KIND_LABELS: Record<DailyTaskKind, string> = {
  [DailyTaskKind.FLASHCARD_REVIEW]: "Ôn thẻ từ",
  [DailyTaskKind.DICTATION]: "Nghe chép",
  [DailyTaskKind.QUIZ]: "Trắc nghiệm",
  [DailyTaskKind.WRITING]: "Luyện viết",
  [DailyTaskKind.SPEAKING]: "Luyện nói",
  [DailyTaskKind.PRONUNCIATION]: "Phát âm",
  [DailyTaskKind.MILESTONE]: "Kiểm tra giai đoạn",
};

export const TASK_KIND_ICONS: Record<DailyTaskKind, IconName> = {
  [DailyTaskKind.FLASHCARD_REVIEW]: "albums-outline",
  [DailyTaskKind.DICTATION]: "headset-outline",
  [DailyTaskKind.QUIZ]: "checkbox-outline",
  [DailyTaskKind.WRITING]: "create-outline",
  [DailyTaskKind.SPEAKING]: "mic-outline",
  [DailyTaskKind.PRONUNCIATION]: "chatbubble-ellipses-outline",
  [DailyTaskKind.MILESTONE]: "flag-outline",
};

export function taskHref(kind: DailyTaskKind, targetId: string): Href {
  switch (kind) {
    case DailyTaskKind.FLASHCARD_REVIEW:
      return {
        pathname: "/study/flashcards/[setId]/study",
        params: { setId: targetId },
      };
    case DailyTaskKind.DICTATION:
      return {
        pathname: "/study/dictation/[lessonId]",
        params: { lessonId: targetId },
      };
    case DailyTaskKind.QUIZ:
      return { pathname: "/study/quiz/[quizId]", params: { quizId: targetId } };
    case DailyTaskKind.WRITING:
      return { pathname: "/study/writing/[id]", params: { id: targetId } };
    case DailyTaskKind.SPEAKING:
      return { pathname: "/study/speaking/[id]", params: { id: targetId } };
    case DailyTaskKind.PRONUNCIATION:
      return {
        pathname: "/study/pronunciation/[lessonId]",
        params: { lessonId: targetId },
      };
    case DailyTaskKind.MILESTONE:
      return "/study/roadmap";
  }
}

export const TASK_UNIT_LABELS: Record<DailyTaskKind, string> = {
  [DailyTaskKind.FLASHCARD_REVIEW]: "thẻ đến hạn",
  [DailyTaskKind.DICTATION]: "câu chưa đạt",
  [DailyTaskKind.WRITING]: "bài viết",
  [DailyTaskKind.SPEAKING]: "bài nói",
  [DailyTaskKind.QUIZ]: "câu hỏi",
  [DailyTaskKind.PRONUNCIATION]: "bài phát âm",
  [DailyTaskKind.MILESTONE]: "bài kiểm tra",
};

export const QUEST_LABELS: Record<DailyQuestKind, string> = {
  [DailyQuestKind.REVIEW_DUE_CARDS]: "Trả hết thẻ đến hạn hôm nay",
  [DailyQuestKind.PASS_A_QUIZ]: "Đạt điểm qua một bài trắc nghiệm",
  [DailyQuestKind.TYPE_SENTENCES]: "Chép lại câu nghe được",
  [DailyQuestKind.PRACTISE_EVERY_DAY]: "Học đủ bảy ngày gần nhất",
};

/** Level names, looked up by floor so any level has one. Same bands as the web. */
const LEVEL_TITLES: { from: number; title: string }[] = [
  { from: 12, title: "Kỳ cựu" },
  { from: 8, title: "Vững vàng" },
  { from: 4, title: "Học giả Tiềm năng" },
  { from: 2, title: "Đang bắt nhịp" },
  { from: 1, title: "Người mới" },
];

export function levelTitle(level: number): string {
  return (
    LEVEL_TITLES.find((entry) => level >= entry.from)?.title ?? "Người mới"
  );
}
