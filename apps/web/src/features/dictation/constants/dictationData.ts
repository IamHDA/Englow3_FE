/**
 * Thống kê và hàng đợi lỗi vẫn là dữ liệu giả - backend chưa có endpoint tiến
 * độ. Danh sách bài đã bị gỡ khỏi đây: nó có thật rồi, lấy qua
 * `dictationLessons`.
 */
import type {
  DictationHistoryItem,
  DictationLevel,
  DictationStatsData,
  DictationTopic,
  DifficultSentenceItem,
  MissedWordItem,
  MistakeReviewItem,
} from "../types";

export const DICTATION_TOPICS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "Tất cả chủ đề" },
  { value: "Daily Conversation", label: "Giao tiếp hàng ngày" },
  { value: "Travel", label: "Du lịch & Sân bay" },
  { value: "Work", label: "Công sở & Họp" },
  { value: "IELTS", label: "Luyện thi IELTS" },
  { value: "TOEIC", label: "Luyện thi TOEIC" },
  { value: "News", label: "Bản tin thời sự" },
  { value: "Academic English", label: "Tiếng Anh học thuật" },
];

export const DICTATION_LEVELS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "Mọi trình độ" },
  { value: "Beginner", label: "Người mới bắt đầu" },
  { value: "Elementary", label: "Sơ cấp" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Upper Intermediate", label: "Trung cấp nâng cao" },
  { value: "Advanced", label: "Nâng cao" },
];

export const DICTATION_STATUSES: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "Not started", label: "Chưa bắt đầu" },
  { value: "In progress", label: "Đang học" },
  { value: "Completed", label: "Đã hoàn thành" },
];

export const DICTATION_SORTS: Array<{ value: string; label: string }> = [
  { value: "recent", label: "Học gần đây nhất" },
  { value: "difficulty", label: "Độ khó tăng dần" },
  { value: "progress", label: "Tiến độ học tập" },
  { value: "newest", label: "Bài học mới nhất" },
];

export const CONTINUE_HERO_LESSON = {
  title: "Daily Conversations – At the Airport",
  topic: "Travel" as DictationTopic,
  level: "Intermediate" as DictationLevel,
  progressText: "8 / 15 câu đã hoàn thành",
  progressPercent: 53,
  lastPracticed: "Hôm qua",
  lessonId: "ordering-food-at-a-restaurant",
};

export const MOCK_MISTAKE_REVIEW_ITEMS: MistakeReviewItem[] = [
  {
    id: "m-1",
    sentenceNumber: 3,
    previousAccuracy: 67,
    learnerAnswer: "I want go station.",
    correctAnswer: "I want to go to the station.",
    audioDurationSeconds: 4,
    explanation:
      "Câu trước bạn gõ 'I want go station.' — thiếu 'to' và mạo từ 'the'.",
  },
  {
    id: "m-2",
    sentenceNumber: 5,
    previousAccuracy: 71,
    learnerAnswer: "She order a coffee and sandwich.",
    correctAnswer: "She ordered a coffee and a sandwich.",
    audioDurationSeconds: 5,
    explanation: "Chú ý thì quá khứ đơn 'ordered' và mạo từ 'a sandwich'.",
  },
  {
    id: "m-3",
    sentenceNumber: 9,
    previousAccuracy: 75,
    learnerAnswer: "Could I have bill please?",
    correctAnswer: "Could I have the bill, please?",
    audioDurationSeconds: 4,
    explanation: "Thiếu mạo từ 'the bill' trong câu đề nghị lịch sự.",
  },
  {
    id: "m-4",
    sentenceNumber: 11,
    previousAccuracy: 60,
    learnerAnswer: "The train arrive at 10 AM.",
    correctAnswer: "The train will arrive at 10 AM.",
    audioDurationSeconds: 5,
    explanation: "Thiếu trợ động từ tương lai 'will arrive'.",
  },
];

export const MOCK_MISSED_WORDS: MissedWordItem[] = [
  {
    word: "thought",
    missedCount: 8,
    correctCount: 12,
    accuracyPercent: 60,
    exampleSentence: "I thought you would have finished it by now.",
  },
  {
    word: "would",
    missedCount: 6,
    correctCount: 18,
    accuracyPercent: 75,
    exampleSentence: "I would like to make a reservation for dinner.",
  },
  {
    word: "although",
    missedCount: 5,
    correctCount: 9,
    accuracyPercent: 64,
    exampleSentence: "Although the flight was delayed, we still made it.",
  },
  {
    word: "through",
    missedCount: 4,
    correctCount: 15,
    accuracyPercent: 79,
    exampleSentence: "The proposal went through several rounds of review.",
  },
];

export const MOCK_DIFFICULT_SENTENCES: DifficultSentenceItem[] = [
  {
    id: "hard-1",
    text: "I thought you would have finished it by now.",
    avgAccuracyPercent: 58,
    attemptsCount: 4,
    topic: "Daily Conversation",
  },
  {
    id: "hard-2",
    text: "Although the flight was delayed, we still made the connection.",
    avgAccuracyPercent: 61,
    attemptsCount: 3,
    topic: "Travel",
  },
  {
    id: "hard-3",
    text: "The figures went through several rounds of review.",
    avgAccuracyPercent: 66,
    attemptsCount: 3,
    topic: "Work",
  },
];

export const MOCK_HISTORY: DictationHistoryItem[] = [
  {
    id: "hist-1",
    date: "Hôm nay",
    lessonTitle: "Ordering Food at a Restaurant",
    sentenceCountLabel: "12 câu",
    accuracyLabel: "88% chính xác",
    studyTimeLabel: "9 phút",
    hintsUsedLabel: "3 gợi ý",
  },
  {
    id: "hist-2",
    date: "Hôm qua",
    lessonTitle: "Airport Announcements",
    sentenceCountLabel: "15 câu",
    accuracyLabel: "79% chính xác",
    studyTimeLabel: "14 phút",
    hintsUsedLabel: "6 gợi ý",
  },
  {
    id: "hist-3",
    date: "12 Th08",
    lessonTitle: "Daily Office Conversations",
    sentenceCountLabel: "10 câu",
    accuracyLabel: "91% chính xác",
    studyTimeLabel: "8 phút",
    hintsUsedLabel: "1 gợi ý",
  },
  {
    id: "hist-4",
    date: "11 Th08",
    lessonTitle: "Morning News Headlines",
    sentenceCountLabel: "9 câu",
    accuracyLabel: "74% chính xác",
    studyTimeLabel: "11 phút",
    hintsUsedLabel: "5 gợi ý",
  },
];

export const MOCK_STATS_DATA: DictationStatsData = {
  period: "7 Days",
  lessonsCompleted: 42,
  averageAccuracyPercent: 86,
  listeningHours: 4.8,
  sentencesPracticed: 684,
  accuracyOverTime: [
    { dateLabel: "09/08", accuracy: 71 },
    { dateLabel: "10/08", accuracy: 74 },
    { dateLabel: "11/08", accuracy: 72 },
    { dateLabel: "12/08", accuracy: 79 },
    { dateLabel: "13/08", accuracy: 83 },
    { dateLabel: "14/08", accuracy: 81 },
    { dateLabel: "15/08", accuracy: 88 },
    { dateLabel: "16/08", accuracy: 86 },
  ],
  practiceActivity: [
    { dayLabel: "T2", sentencesCount: 24 },
    { dayLabel: "T3", sentencesCount: 35 },
    { dayLabel: "T4", sentencesCount: 12 },
    { dayLabel: "T5", sentencesCount: 42 },
    { dayLabel: "T6", sentencesCount: 28 },
    { dayLabel: "T7", sentencesCount: 56 },
    { dayLabel: "CN", sentencesCount: 31 },
  ],
  missedWords: MOCK_MISSED_WORDS,
  difficultSentences: MOCK_DIFFICULT_SENTENCES,
  history: MOCK_HISTORY,
};

export const DEFAULT_WAVEFORM_BARS = [
  12, 20, 34, 46, 30, 22, 38, 44, 26, 18, 30, 42, 46, 34, 20, 14, 24, 36, 44,
  40, 28, 18, 12, 22, 34, 46, 42, 30, 20, 26, 38, 44, 32, 22, 16, 24, 36, 40,
  34, 24, 18, 12, 20, 30, 26, 18, 14, 10,
];
