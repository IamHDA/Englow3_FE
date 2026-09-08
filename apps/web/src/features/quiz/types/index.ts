export type QuizQuestionType =
  | "MULTIPLE_CHOICE"
  | "FILL_BLANK"
  | "REWRITE"
  | "REORDER"
  | "MATCHING";

export type DailyPathNodeStatus = "COMPLETED" | "CURRENT" | "LOCKED";

export interface DailyPathNode {
  id: string;
  title: string;
  subtitle: string;
  type: "LESSON" | "QUIZ" | "CHALLENGE" | "MILESTONE";
  status: DailyPathNodeStatus;
  order: number;
  xpReward: number;
  starsEarned?: number; // 0..3
  targetQuizId?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardXp: number;
  isCompleted: boolean;
}

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
