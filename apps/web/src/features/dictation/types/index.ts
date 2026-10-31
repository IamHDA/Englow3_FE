import type {
  DictationLessonFieldsFragment,
  DictationSentenceFieldsFragment,
  SubmitDictationMutation,
  DictationMistakesQuery,
} from "@/lib/graphql/generated/documents";

/**
 * Bài và câu như BFF trả về, lấy thẳng hình dạng codegen sinh. Câu mang cả
 * transcript để màn luyện tập chấm ngay trên trình duyệt; điểm được lưu vẫn là
 * điểm server chấm lại.
 */
export type DictationLesson = DictationLessonFieldsFragment;
export type DictationSentence = DictationSentenceFieldsFragment;

/** Kết quả server chấm cho một lần nộp (màn ôn câu sai vẫn chấm theo đường này). */
export type DictationSubmission = SubmitDictationMutation["submitDictation"];

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

export interface DictationProgressiveFeedback {
  correct: boolean;
  words: Array<{
    text: string;
    state: "correct" | "hint" | "masked";
  }>;
}

/**
 * Một câu người học hay sai, kèm đủ thứ để luyện lại.
 *
 * Trước đây là interface tự viết kèm bốn mục bịa, mỗi mục có một đoạn giải
 * thích ngữ pháp viết tay. Giờ lấy từ codegen, và trường `explanation` đã biến
 * mất vì không có gì sinh ra nó.
 */
export type MistakeSentence =
  DictationMistakesQuery["dictationMistakes"][number];

export interface SessionMetrics {
  replays: number;
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
  lessonLevel: string;
  overallAccuracyPercent: number;
  wordsCorrectRatio: string;
  sentencesCompletedCount: number;
  studyDurationFormatted: string;
  metrics: SessionMetrics;
  breakdown: PerformanceBreakdown;
  mistakes: Array<{
    id: string;
    /** Số thứ tự câu; chữ "Câu"/"Sentence" do giao diện chọn theo ngôn ngữ. */
    sentenceNumber: number;
    accuracyPercent: number;
    /** Rỗng khi người học bỏ qua câu - giao diện tự ghi "(Bỏ qua)"/"(Skipped)". */
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
  lessonId: string;
  text: string;
  avgAccuracyPercent: number;
  attemptsCount: number;
  topic: DictationTopic;
}

export interface DictationHistoryItem {
  lessonId: string;
  id: string;
  date: string;
  lessonTitle: string;
  sentenceCountLabel: string;
  accuracyLabel: string;
  studyTimeLabel: string;
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
