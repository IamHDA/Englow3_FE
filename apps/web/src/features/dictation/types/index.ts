export type DictationLevel =
  | "Beginner"
  | "Elementary"
  | "Intermediate"
  | "Upper Intermediate"
  | "Advanced";

export type DictationTopic =
  | "Daily Conversation"
  | "Travel"
  | "Work"
  | "IELTS"
  | "TOEIC"
  | "News"
  | "Academic English";

export type DictationStatus = "Not started" | "In progress" | "Completed";

export interface DictationSentence {
  id: string;
  order: number;
  text: string;
  audioDurationSeconds: number;
  translationVi: string;
  hints: {
    wordCount: number;
    firstLetters: string;
    revealWord: string;
    translation: string;
    partialTranscript: string;
  };
}

export interface DictationLesson {
  id: string;
  slug: string;
  title: string;
  topic: DictationTopic;
  level: DictationLevel;
  sentenceCount: number;
  estimatedTime: string;
  progressPercent: number;
  status: DictationStatus;
  sentences: DictationSentence[];
  lastPracticed?: string;
  completedSentences?: number;
}

export type DiffType = "ok" | "bad" | "missing" | "extra";

export interface DiffItem {
  text: string;
  type: DiffType;
  expected?: string;
  actual?: string;
}

export interface DiffResult {
  accuracyPercent: number;
  correctWordsCount: number;
  totalWordsCount: number;
  mistakesCount: number;
  items: DiffItem[];
  fixes: Array<{
    from: string;
    to: string;
    strike: boolean;
  }>;
}

export interface MistakeReviewItem {
  id: string;
  sentenceNumber: number;
  previousAccuracy: number;
  learnerAnswer: string;
  correctAnswer: string;
  audioDurationSeconds: number;
  explanation: string;
}

export interface SessionMetrics {
  replays: number;
  hintsUsed: number;
  perfectSentences: number;
  sentencesWithMistakes: number;
}

export interface PerformanceBreakdown {
  correctPercent: number;
  incorrectPercent: number;
  missingPercent: number;
}

export interface DictationSessionSummaryData {
  lessonTitle: string;
  lessonLevel: DictationLevel;
  overallAccuracyPercent: number;
  wordsCorrectRatio: string;
  sentencesCompletedCount: number;
  studyDurationFormatted: string;
  metrics: SessionMetrics;
  breakdown: PerformanceBreakdown;
  mistakes: Array<{
    id: string;
    sentenceLabel: string;
    accuracyPercent: number;
    learnerAnswer: string;
    correctAnswer: string;
  }>;
}

export interface MissedWordItem {
  word: string;
  missedCount: number;
  correctCount: number;
  accuracyPercent: number;
  exampleSentence?: string;
}

export interface DifficultSentenceItem {
  id: string;
  text: string;
  avgAccuracyPercent: number;
  attemptsCount: number;
  topic: DictationTopic;
}

export interface DictationHistoryItem {
  id: string;
  date: string;
  lessonTitle: string;
  sentenceCountLabel: string;
  accuracyLabel: string;
  studyTimeLabel: string;
  hintsUsedLabel: string;
}

export interface DictationStatsData {
  period: "7 Days" | "30 Days" | "3 Months" | "All Time";
  lessonsCompleted: number;
  averageAccuracyPercent: number;
  listeningHours: number;
  sentencesPracticed: number;
  accuracyOverTime: Array<{
    dateLabel: string;
    accuracy: number;
  }>;
  practiceActivity: Array<{
    dayLabel: string;
    sentencesCount: number;
  }>;
  missedWords: MissedWordItem[];
  difficultSentences: DifficultSentenceItem[];
  history: DictationHistoryItem[];
}
