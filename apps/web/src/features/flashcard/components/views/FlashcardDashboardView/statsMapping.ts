import type { FlashcardStatsQuery } from "@/lib/graphql/generated/documents";

import type { FlashcardStatsData } from "../../../types";

type ApiStats = FlashcardStatsQuery["flashcardStats"];

/** Số ngày cho mỗi mốc thời gian trên tab thống kê. */
export const STATS_PERIOD_DAYS: Record<FlashcardStatsData["period"], number> = {
  "7 Days": 7,
  "30 Days": 30,
  "3 Months": 90,
  "All Time": 365,
};

function formatDuration(seconds: number, isVi: boolean): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return isVi ? `${minutes} phút` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return isVi ? `${hours} giờ ${rest} phút` : `${hours}h ${rest}m`;
}

function formatDay(day: string, isVi: boolean): string {
  return new Date(day).toLocaleDateString(isVi ? "vi-VN" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
  });
}

/**
 * Chuyển số liệu API sang mô hình hiển thị các block đang dùng.
 *
 * Các block muốn chuỗi đã định dạng sẵn ("3 giờ 20 phút", "22/09"); API trả về
 * giây và ngày ISO. Đổi ở một chỗ tường minh, không rải `toLocaleDateString`
 * khắp bốn block.
 */
export function toStatsData(
  stats: ApiStats,
  period: FlashcardStatsData["period"],
  isVi: boolean,
): FlashcardStatsData {
  return {
    period,
    totalCardsLearned: stats.cardsStudied,
    retentionRatePercent: stats.retentionPercent,
    // Một chữ số thập phân: "0 giờ" cho hai mươi phút học là sai.
    studyTimeHours: Math.round((stats.studySeconds / 3600) * 10) / 10,
    dailyStreakDays: stats.streakDays,
    activityDays: stats.activity.map((day) => ({
      day: formatDay(day.day, isVi),
      cardsCount: day.cardCount,
    })),
    difficultCards: stats.difficultCards.map((card) => ({
      id: card.flashcardId,
      card: card.lemma,
      set: card.setName,
      missCount: card.lapseCount,
      lastReview: card.lastReviewed
        ? formatDay(card.lastReviewed, isVi)
        : isVi
          ? "Chưa ôn"
          : "Not reviewed",
    })),
    history: stats.history.map((session) => ({
      // Không có id trên dòng lịch sử - nó là một nhóm theo ngày và bộ thẻ, nên
      // khoá cũng phải là hai thứ đó.
      id: `${session.day}-${session.setId}`,
      date: formatDay(session.day, isVi),
      set: session.setName,
      cardsCount: session.cardCount,
      recallPercent: session.recallPercent,
      studyTime: formatDuration(session.studySeconds, isVi),
    })),
  };
}
