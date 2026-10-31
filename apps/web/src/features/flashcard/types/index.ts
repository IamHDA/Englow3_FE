import type {
  FlashcardFieldsFragment,
  FlashcardSetFieldsFragment,
} from "@/lib/graphql/generated/documents";
import type { ReviewRating } from "@/lib/graphql/generated";

export type FlashcardTopic =
  | "IELTS"
  | "TOEIC"
  | "Work"
  | "Daily Conversation"
  | "Academic English"
  | "Travel";

/**
 * A card and a set as the BFF returns them. Derived from codegen rather than
 * declared again here - the schema owns the shape, and two declarations of it
 * drift the moment a field is added.
 */
export type FlashcardItem = FlashcardFieldsFragment;
export type FlashcardSet = FlashcardSetFieldsFragment;

/** The four buttons, as the schema names them. */
export type SRSRating = ReviewRating;

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
