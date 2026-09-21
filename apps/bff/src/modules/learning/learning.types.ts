// mirrors the learning module's REST contract exactly as the backend returns it.

export type FlashcardReviewStatus = "NEW" | "LEARNING" | "REVIEW" | "MASTERED";

export type ReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

// GET /api/flashcards/sets
export type FlashcardSetResponse = {
  id: string;
  slug: string;
  name: string;
  description: string;
  topic: string;
  /** Null on a set that deliberately mixes levels. */
  targetLevel: string | null;
  cardCount: number;
  /** Per learner, not per set - two learners see different numbers here. */
  dueCount: number;
  masteredCount: number;
  /** Null until the learner has answered a card in this set. */
  lastStudiedAt: string | null;
};

export type FlashcardSetPageResponse = {
  items: FlashcardSetResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

// Audio arrives pre-signed and short-lived; the backend resolves object keys for us.
export type FlashcardResponse = {
  id: string;
  orderNo: number;
  lemma: string;
  partOfSpeech: string;
  senseLabel: string;
  ipaUs: string;
  ipaUk: string | null;
  audioUsUrl: string | null;
  audioUkUrl: string | null;
  definitionEn: string;
  definitionVi: string;
  exampleSentence: string;
  exampleTranslationVi: string | null;
  mnemonicTipVi: string | null;
  cefrLevel: string | null;
  status: FlashcardReviewStatus;
  /** Null for a card the learner has never answered - no review row exists yet. */
  dueAt: string | null;
  lapseCount: number;
};

// GET /api/flashcards/sets/{id}
export type FlashcardSetDetailResponse = {
  set: FlashcardSetResponse;
  cards: FlashcardResponse[];
};

// POST /api/flashcards/{id}/reviews
export type FlashcardReviewResponse = {
  flashcardId: string;
  status: FlashcardReviewStatus;
  repetitions: number;
  intervalDays: number;
  dueAt: string;
  lapseCount: number;
};

export type RateFlashcardRequest = {
  rating: ReviewRating;
  timeSpentSeconds: number;
};

export type SearchFlashcardSetsParams = {
  topic?: string;
  title?: string;
  page?: number;
  size?: number;
};
