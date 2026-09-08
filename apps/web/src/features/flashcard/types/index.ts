export type FlashcardTopic =
  | "IELTS"
  | "TOEIC"
  | "Work"
  | "Daily Conversation"
  | "Academic English"
  | "Travel";

export type FlashcardStatus = "New" | "Learning" | "Review" | "Mastered";

export type SRSRating = "Again" | "Hard" | "Good" | "Easy";

export interface FlashcardItem {
  id: string;
  front: string;
  ipa: string;
  pos: string; // Part of speech: Verb, Noun, Adjective...
  definition: string;
  translationVi: string;
  exampleSentence: string;
  memoryNote?: string;
  status: FlashcardStatus;
  lastReviewed?: string;
  missCount: number;
}

export interface FlashcardSet {
  id: string;
  slug: string;
  name: string;
  topic: FlashcardTopic;
  description: string;
  totalCards: number;
  masteredPercent: number;
  dueTodayCount: number;
  lastStudied: string;
  cards: FlashcardItem[];
}

export interface FlashcardStudyResult {
  cardId: string;
  rating: SRSRating;
  timeSpentSeconds: number;
}

export interface FlashcardSessionSummaryData {
  setName: string;
  totalReviewed: number;
  accuracyPercent: number;
  studyDurationFormatted: string;
  breakdown: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export interface FlashcardStatsData {
  period: "7 Days" | "30 Days" | "3 Months" | "All Time";
  totalCardsLearned: number;
  retentionRatePercent: number;
  studyTimeHours: number;
  dailyStreakDays: number;
  activityDays: Array<{
    day: string;
    cardsCount: number;
  }>;
  difficultCards: Array<{
    id: string;
    card: string;
    set: string;
    missCount: number;
    lastReview: string;
  }>;
  history: Array<{
    id: string;
    date: string;
    set: string;
    cardsCount: number;
    recallPercent: number;
    studyTime: string;
  }>;
}
