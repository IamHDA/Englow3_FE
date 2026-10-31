import type { AppTranslations } from "@/shared/constants/translations";
import type { DictationLesson } from "./types";

export type DictationLessonStatus = "Not started" | "In progress" | "Completed";

/**
 * Các con số hiển thị được suy ra từ hai thứ backend trả về: tổng số câu và số
 * câu đã đạt. Tính ở một chỗ vì lưới, bảng và trang chi tiết đều cần - ba bản
 * sao của cùng một phép chia là ba cơ hội để chúng nói khác nhau.
 */
export function progressPercent(lesson: DictationLesson): number {
  if (lesson.sentenceCount === 0) return 0;
  return Math.round(
    (lesson.completedSentenceCount / lesson.sentenceCount) * 100,
  );
}

export function lessonStatus(lesson: DictationLesson): DictationLessonStatus {
  if (lesson.completedSentenceCount === 0) return "Not started";
  if (lesson.completedSentenceCount >= lesson.sentenceCount) return "Completed";
  return "In progress";
}

/** Tổng thời lượng audio, làm tròn lên phút - "0 phút" cho một bài có tiếng là sai. */
export function estimatedTime(
  lesson: DictationLesson,
  t: AppTranslations,
): string {
  const minutes = Math.max(1, Math.ceil(lesson.totalDurationSeconds / 60));
  return `${minutes} ${t.dictation.minutesUnit}`;
}

/** null nghĩa là chưa từng luyện, khác hẳn với "luyện 0 ngày trước". */
export function lastPractisedLabel(
  lesson: DictationLesson,
  t: AppTranslations,
): string {
  if (!lesson.lastPractisedAt) return t.dictation.notPractisedYet;

  const days = Math.floor(
    (Date.now() - Date.parse(lesson.lastPractisedAt)) / 86_400_000,
  );
  if (days <= 0) return t.dictation.practisedToday;
  if (days === 1) return t.dictation.practisedYesterday;
  return `${days} ${t.dictation.daysAgoSuffix}`;
}
