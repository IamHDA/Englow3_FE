import type { FlashcardStatsData } from "../types";

/**
 * Số liệu thống kê vẫn là dữ liệu giả. Backend chưa có endpoint tiến độ - đó là
 * việc của phần dashboard, và khi có thì cả file này biến mất.
 *
 * Danh sách bộ thẻ giả đã bị gỡ: nó có thật rồi, lấy qua `flashcardSets`.
 */
export const MOCK_FLASHCARD_STATS: FlashcardStatsData = {
  period: "7 Days",
  totalCardsLearned: 342,
  retentionRatePercent: 88,
  studyTimeHours: 12.5,
  dailyStreakDays: 14,
  activityDays: [
    { day: "T2", cardsCount: 35 },
    { day: "T3", cardsCount: 48 },
    { day: "T4", cardsCount: 42 },
    { day: "T5", cardsCount: 60 },
    { day: "T6", cardsCount: 52 },
    { day: "T7", cardsCount: 75 },
    { day: "CN", cardsCount: 30 },
  ],
  difficultCards: [
    {
      id: "card-2",
      card: "substantiate",
      set: "IELTS 7.5+ Core Academic Vocabulary",
      missCount: 4,
      lastReview: "3 ngày trước",
    },
    {
      id: "card-6",
      card: "paradigm",
      set: "IELTS 7.5+ Core Academic Vocabulary",
      missCount: 3,
      lastReview: "Hôm qua",
    },
    {
      id: "card-4",
      card: "ubiquitous",
      set: "IELTS 7.5+ Core Academic Vocabulary",
      missCount: 3,
      lastReview: "1 ngày trước",
    },
    {
      id: "toeic-2",
      card: "in compliance with",
      set: "TOEIC 850+ Office & Business Collocations",
      missCount: 2,
      lastReview: "2 ngày trước",
    },
  ],
  history: [
    {
      id: "hist-1",
      date: "08/09/2026 - 08:30",
      set: "IELTS 7.5+ Core Academic Vocabulary",
      cardsCount: 20,
      recallPercent: 85,
      studyTime: "14 phút",
    },
    {
      id: "hist-2",
      date: "07/09/2026 - 21:15",
      set: "Daily Conversational Idioms & Slang",
      cardsCount: 15,
      recallPercent: 93,
      studyTime: "9 phút",
    },
    {
      id: "hist-3",
      date: "06/09/2026 - 19:40",
      set: "TOEIC 850+ Office & Business Collocations",
      cardsCount: 24,
      recallPercent: 79,
      studyTime: "18 phút",
    },
    {
      id: "hist-4",
      date: "05/09/2026 - 07:50",
      set: "IELTS 7.5+ Core Academic Vocabulary",
      cardsCount: 18,
      recallPercent: 88,
      studyTime: "12 phút",
    },
  ],
};
