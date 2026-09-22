import type {
  DailyPathQuery,
  QuizFieldsFragment,
} from "@/lib/graphql/generated/documents";

/** A quiz as the catalogue lists it, straight off codegen rather than declared twice. */
export type QuizSummary = QuizFieldsFragment;

export type QuizQuestionType =
  "MULTIPLE_CHOICE" | "FILL_BLANK" | "REWRITE" | "REORDER" | "MATCHING";

/**
 * Lộ trình hôm nay. Ba kiểu này từng là interface tự viết kèm một file dữ liệu
 * giả: sáu trạm, ba nhiệm vụ, chuỗi 6 ngày, cấp 4 với 1420 XP - không con số
 * nào nhúc nhích khi người học thực sự học. Giờ lấy hết từ `dailyPath`.
 */
export type DailyPath = DailyPathQuery["dailyPath"];
export type DailyTask = DailyPath["tasks"][number];
export type DailyQuest = DailyPath["quests"][number];

export interface MultipleChoiceOption {
  id: string;
  label: string; // A, B, C, D
  text: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  title: string;
  prompt: string;
  points: number;
  explanation: string;

  // Type-specific payloads:
  // 1. Multiple Choice
  mcOptions?: MultipleChoiceOption[];
  correctOptionId?: string;

  // 2. Fill in the blank
  beforeText?: string;
  afterText?: string;
  acceptedAnswers?: string[];

  // 3. Sentence Rewrite
  originalSentence?: string;
  rewriteKeyword?: string;
  rewriteWordBank?: string[];
  correctRewriteWords?: string[];

  // 4. Word Reorder
  scrambledWords?: string[];
  correctOrderWords?: string[];

  // 5. Matching Clauses
  matchingPairs?: MatchingPair[];
}

export interface QuizItem {
  id: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  bestScorePercent?: number;
  totalAttempts?: number;
  questions: QuizQuestion[];
}

export interface QuestionReview {
  questionId: string;
  type: QuizQuestionType;
  prompt: string;
  userAnswerText: string;
  correctAnswerText: string;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
  explanation: string;
}

export interface QuizSessionResult {
  quizId: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  scorePercent: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  reviews: QuestionReview[];
}
