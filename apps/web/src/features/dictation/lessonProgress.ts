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
export function estimatedTime(lesson: DictationLesson, isVi: boolean): string {
  const minutes = Math.max(1, Math.ceil(lesson.totalDurationSeconds / 60));
  return isVi ? `${minutes} phút` : `${minutes} mins`;
}

/** null nghĩa là chưa từng luyện, khác hẳn với "luyện 0 ngày trước". */
export function lastPractisedLabel(
  lesson: DictationLesson,
  isVi: boolean,
): string {
  if (!lesson.lastPractisedAt) return isVi ? "Chưa luyện" : "Not started";

  const days = Math.floor(
    (Date.now() - Date.parse(lesson.lastPractisedAt)) / 86_400_000,
  );
  if (days <= 0) return isVi ? "Hôm nay" : "Today";
  if (days === 1) return isVi ? "Hôm qua" : "Yesterday";
  return isVi ? `${days} ngày trước` : `${days} days ago`;
}
