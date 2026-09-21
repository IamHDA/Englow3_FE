import type { DictationStatsQuery } from "@/lib/graphql/generated/documents";

import type { DictationStatsData, DictationTopic } from "../../../types";

type ApiStats = DictationStatsQuery["dictationStats"];

/** Số ngày cho mỗi mốc thời gian trên tab thống kê. */
export const STATS_PERIOD_DAYS: Record<DictationStatsData["period"], number> = {
  "7 Days": 7,
  "30 Days": 30,
  "3 Months": 90,
  "All Time": 365,
};

function formatDay(day: string, isVi: boolean): string {
  return new Date(day).toLocaleDateString(isVi ? "vi-VN" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatDuration(seconds: number, isVi: boolean): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return isVi ? `${minutes} phút` : `${minutes}m`;
  return isVi
    ? `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/**
 * Chuyển số liệu API sang mô hình hiển thị các block đang dùng. Cùng lý do với
 * bên flashcard: block muốn chuỗi đã định dạng, API trả giây và ngày ISO.
 */
export function toStatsData(
  stats: ApiStats,
  period: DictationStatsData["period"],
  isVi: boolean,
): DictationStatsData {
  return {
    period,
    lessonsCompleted: stats.lessonsCompleted,
    averageAccuracyPercent: stats.averageAccuracyPercent,
    // Một chữ số thập phân: "0 giờ" cho hai mươi phút nghe là sai.
    listeningHours: Math.round((stats.listeningSeconds / 3600) * 10) / 10,
    sentencesPracticed: stats.sentencesPractised,
    accuracyOverTime: stats.activity.map((day) => ({
      dateLabel: formatDay(day.day, isVi),
      accuracy: day.accuracyPercent,
    })),
    practiceActivity: stats.activity.map((day) => ({
      dayLabel: formatDay(day.day, isVi),
      sentencesCount: day.attemptCount,
    })),
    missedWords: stats.missedWords.map((word) => ({
      word: word.word,
      missedCount: word.missedCount,
      correctCount: word.correctCount,
      accuracyPercent: word.accuracyPercent,
    })),
    difficultSentences: stats.difficultSentences.map((sentence) => ({
      id: sentence.sentenceId,
      text: sentence.text,
      avgAccuracyPercent: sentence.accuracyPercent,
      attemptsCount: sentence.attemptCount,
      // Chủ đề là một cột chữ tự do ở backend, không phải tập đóng. Ép kiểu ở
      // đây chứ không nới lỏng type của block, vì block chỉ dùng nó để hiện.
      topic: sentence.topic as DictationTopic,
    })),
    history: stats.history.map((session) => ({
      // Không có id trên dòng lịch sử - nó là một nhóm theo ngày và bài.
      id: `${session.day}-${session.lessonId}`,
      date: formatDay(session.day, isVi),
      lessonTitle: session.lessonTitle,
      sentenceCountLabel: isVi
        ? `${session.sentenceCount} câu`
        : `${session.sentenceCount} sentences`,
      accuracyLabel: `${session.accuracyPercent}%`,
      studyTimeLabel: formatDuration(session.listeningSeconds, isVi),
      // Số gợi ý đã dùng chưa được ghi lại - cần một cột trên dictation_attempts.
      hintsUsedLabel: "—",
    })),
  };
}
