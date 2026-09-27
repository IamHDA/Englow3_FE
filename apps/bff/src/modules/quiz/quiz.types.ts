import type {
  QuizAttemptStatus,
  QuizQuestionType,
} from "../../generated/graphql.js";

// mirrors the quiz module's REST contract exactly as the backend returns it.

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
