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

export type QuizQuestionType =
  "MULTIPLE_CHOICE" | "FILL_BLANK" | "REWRITE" | "REORDER" | "MATCHING";

export type QuizAttemptStatus = "IN_PROGRESS" | "SCORED" | "EXPIRED";

// GET /api/quizzes
export type QuizSummaryResponse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  targetLevel: string | null;
  timeLimitSeconds: number;
  passingScorePercent: number;
  questionCount: number;
  /** Per learner. Null until they have finished one. */
  bestScorePercent: number | null;
  attemptCount: number;
};

export type QuizPageResponse = {
  items: QuizSummaryResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

// An option as the learner sees it while sitting - there is no `correct` field
// on this shape at all, which is why the answer key cannot leak from it.
export type QuizOptionResponse = {
  id: string;
  orderNo: number;
  label: string;
  content: string;
};

export type QuizPaperQuestionResponse = {
  id: string;
  orderNo: number;
  questionType: QuizQuestionType;
  title: string;
  prompt: string;
  points: number;
  beforeText: string | null;
  afterText: string | null;
  originalSentence: string | null;
  rewriteKeyword: string | null;
  options: QuizOptionResponse[];
  wordBank: string[];
  scrambledWords: string[];
  leftTexts: string[];
  /** Shuffled by the backend per attempt - the stored order is the answer. */
  rightTexts: string[];
};

// GET /api/quiz-attempts/{id}/paper
export type QuizPaperResponse = {
  attemptId: string;
  quizId: string;
  title: string;
  description: string;
  timeLimitSeconds: number;
  expiresAt: string;
  questions: QuizPaperQuestionResponse[];
};

export type QuizQuestionReviewResponse = {
  questionId: string;
  questionType: QuizQuestionType;
  prompt: string;
  userAnswerText: string;
  correctAnswerText: string;
  correct: boolean;
  pointsEarned: number;
  pointsPossible: number;
  explanation: string;
};

// POST /api/quizzes/{id}/attempts, POST /api/quiz-attempts/{id}/submit, GET .../result
export type QuizAttemptResponse = {
  id: string;
  quizId: string;
  quizTitle: string;
  status: QuizAttemptStatus;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number;
  scorePercentage: number | null;
  correctAnswerCount: number | null;
  questionCount: number;
  passed: boolean | null;
  resumed: boolean;
  /** Empty while the attempt is IN_PROGRESS - it carries the answer key. */
  reviews: QuizQuestionReviewResponse[];
};

export type SubmitQuizAttemptRequest = {
  answers: { questionId: string; response: string }[];
};

export type SearchQuizzesParams = {
  category?: string;
  title?: string;
  page?: number;
  size?: number;
};

// GET /api/dictation/lessons
export type DictationLessonResponse = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  targetLevel: string | null;
  sentenceCount: number;
  /** Per learner: sentences whose best attempt cleared the completion threshold. */
  completedSentenceCount: number;
  totalDurationSeconds: number;
  lastPractisedAt: string | null;
};

export type DictationLessonPageResponse = {
  items: DictationLessonResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

// A sentence as the learner practises it. There is deliberately no transcript
// field: the answer arrives only in the response to a submission.
export type DictationSentenceResponse = {
  id: string;
  orderNo: number;
  audioUrl: string;
  audioDurationSeconds: number;
  hintWordCount: number;
  hintFirstLetters: string | null;
  hintRevealWord: string | null;
  hintPartialTranscript: string | null;
  /** Both null means the file is this sentence; see the typeDefs. */
  audioStartMs: number | null;
  audioEndMs: number | null;
  bestAccuracyPercent: number | null;
};

// GET /api/dictation/lessons/{id}
export type DictationLessonDetailResponse = {
  lesson: DictationLessonResponse;
  sentences: DictationSentenceResponse[];
};

// POST /api/dictation/sentences/{id}/attempts - the only shape carrying the transcript
export type DictationSubmissionResponse = {
  sentenceId: string;
  correctText: string;
  translationVi: string | null;
  response: string;
  accuracyPercent: number;
  correctWordCount: number;
  totalWordCount: number;
};

export type SearchDictationLessonsParams = {
  topic?: string;
  title?: string;
  page?: number;
  size?: number;
};

// GET /api/flashcards/stats
export type FlashcardStatsResponse = {
  periodDays: number;
  cardsStudied: number;
  retentionPercent: number;
  studySeconds: number;
  /** Counted over a year, not over the period - a 7-day view still shows a 40-day streak. */
  streakDays: number;
  activity: { day: string; cardCount: number }[];
  difficultCards: {
    flashcardId: string;
    lemma: string;
    setName: string;
    lapseCount: number;
    lastReviewed: string | null;
  }[];
  history: {
    day: string;
    setId: string;
    setName: string;
    cardCount: number;
    recallPercent: number;
    studySeconds: number;
  }[];
};

// GET /api/dictation/stats
export type DictationStatsResponse = {
  periodDays: number;
  lessonsCompleted: number;
  averageAccuracyPercent: number;
  listeningSeconds: number;
  sentencesPractised: number;
  streakDays: number;
  activity: { day: string; accuracyPercent: number; attemptCount: number }[];
  missedWords: {
    word: string;
    missedCount: number;
    correctCount: number;
    accuracyPercent: number;
  }[];
  difficultSentences: {
    sentenceId: string;
    text: string;
    topic: string;
    accuracyPercent: number;
    attemptCount: number;
  }[];
  history: {
    day: string;
    lessonId: string;
    lessonTitle: string;
    sentenceCount: number;
    accuracyPercent: number;
    listeningSeconds: number;
  }[];
};

// GET /api/daily-path
export type DailyPathResponse = {
  streakDays: number;
  /** Derived from activity on every read, not stored - see the backend's ExperiencePoints. */
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  levelCostXp: number;
  tasks: {
    kind: "FLASHCARD_REVIEW" | "DICTATION" | "QUIZ";
    status: "COMPLETED" | "CURRENT" | "UPCOMING";
    targetId: string;
    title: string;
    order: number;
    unitsRemaining: number;
    unitsDoneToday: number;
    completionPercent: number | null;
    xpReward: number;
  }[];
  quests: {
    kind:
      | "REVIEW_DUE_CARDS"
      | "PASS_A_QUIZ"
      | "TYPE_SENTENCES"
      | "PRACTISE_EVERY_DAY";
    progress: number;
    target: number;
    completed: boolean;
  }[];
};

/**
 * The three kinds of practice content share one review workflow, so the BFF
 * presents one surface over three backend resources rather than triplicating
 * the schema. The backend keeps them separate on purpose - they are separate
 * resources with separate lifecycles - and collapsing them is exactly the kind
 * of per-client shaping a BFF exists to do.
 */
export type ContentKind =
  "FLASHCARD_SET" | "QUIZ" | "DICTATION_LESSON" | "SPEAKING_PROMPT";

export type ContentStatus =
  "DRAFT" | "PENDING_REVIEW" | "REJECTED" | "PUBLISHED" | "ARCHIVED";

// mirrors ContentReviewResponse exactly as the backend returns it
export type ContentReviewResponse = {
  id: string;
  slug: string;
  title: string;
  /**
   * Sent as a string because the backend's three status enums are separate
   * types with identical values. The GraphQL enum above is what validates it.
   */
  status: ContentStatus;
  /**
   * Cards, questions or sentences - whatever this kind is made of. Null for a
   * speaking prompt, which is one sentence rather than a collection of things:
   * "1 item" would be true and tell a reviewer nothing.
   */
  itemCount: number | null;
  createdAt: string;
  publishedAt: string | null;
  submittedForReviewAt: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};

export type ContentReviewPageResponse = {
  items: ContentReviewResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type SearchContentParams = {
  kind: ContentKind;
  status?: ContentStatus | null;
  title?: string | null;
  page?: number;
  size?: number;
};

// GET /api/dictation/mistakes
export type MistakeSentenceResponse = {
  sentenceId: string;
  /** The correct sentence. Safe here: every row is a line the learner has already answered. */
  text: string;
  audioUrl: string;
  audioDurationSeconds: number;
  lessonId: string;
  lessonTitle: string;
  bestAccuracyPercent: number;
  attemptCount: number;
  /** The last thing they typed, so the screen can show what changed. */
  lastResponse: string | null;
};

/**
 * The speaking module's own review shape. It is not ContentReviewResponse and
 * cannot be: that record lives in the backend's learning module, and a
 * persistence-adjacent type does not cross a module boundary there.
 *
 * Reconciling the two is a per-client concern, so it happens here.
 */
export type SpeakingPromptReviewResponse = {
  id: string;
  slug: string;
  title: string;
  category: string;
  targetLevel: string | null;
  referenceText: string;
  status: ContentStatus;
  createdAt: string;
  publishedAt: string | null;
  submittedForReviewAt: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};

export type SpeakingPromptReviewPageResponse = {
  items: SpeakingPromptReviewResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};
