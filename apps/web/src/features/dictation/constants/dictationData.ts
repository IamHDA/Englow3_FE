/**
 * Chỉ còn nhãn bộ lọc và tuỳ chọn sắp xếp - những thứ thuộc về giao diện. Mọi
 * dữ liệu của người học đều lấy từ backend.
 */
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

export const DEFAULT_WAVEFORM_BARS = [
  12, 20, 34, 46, 30, 22, 38, 44, 26, 18, 30, 42, 46, 34, 20, 14, 24, 36, 44,
  40, 28, 18, 12, 22, 34, 46, 42, 30, 20, 26, 38, 44, 32, 22, 16, 24, 36, 40,
  34, 24, 18, 12, 20, 30, 26, 18, 14, 10,
];
