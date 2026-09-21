/**
 * Chỉ còn hàng đợi ôn câu sai là dữ liệu giả - chưa có endpoint "những câu tôi
 * hay chép sai". Danh sách bài và toàn bộ thống kê đã lấy từ backend.
 */
import type {
  DictationLevel,
  DictationTopic,
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

export const DEFAULT_WAVEFORM_BARS = [
  12, 20, 34, 46, 30, 22, 38, 44, 26, 18, 30, 42, 46, 34, 20, 14, 24, 36, 44,
  40, 28, 18, 12, 22, 34, 46, 42, 30, 20, 26, 38, 44, 32, 22, 16, 24, 36, 40,
  34, 24, 18, 12, 20, 30, 26, 18, 14, 10,
];
