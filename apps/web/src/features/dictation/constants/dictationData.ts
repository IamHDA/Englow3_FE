/**
 * Chỉ còn nhãn bộ lọc và tuỳ chọn sắp xếp - những thứ thuộc về giao diện. Mọi
 * dữ liệu của người học đều lấy từ backend.
 *
 * Mỗi lựa chọn mang cả hai nhãn thay vì một `label` VI-only kèm bảng tra tiếng
 * Anh riêng ở nơi dùng: `value` không phải backend enum, chỉ là filter param
 * tự chọn, và nhãn của nó là dữ liệu của chính lựa chọn đó - hợp lý hơn khi đi
 * cùng `value`/`labelVi`/`labelEn` một chỗ thay vì lặp lại `value` ở một bảng
 * tra tiếng Anh khác dễ lệch khỏi danh sách gốc (như DICTATION_SORTS's "recent
 * sort" values từng không khớp bảng tiếng Anh cũ, rơi về nhãn tiếng Việt).
 */
export const DICTATION_TOPICS: Array<{
  value: string;
  labelVi: string;
  labelEn: string;
}> = [
  { value: "ALL", labelVi: "Tất cả chủ đề", labelEn: "All Topics" },
  {
    value: "Daily Conversation",
    labelVi: "Giao tiếp hàng ngày",
    labelEn: "Daily Conversation",
  },
  { value: "Travel", labelVi: "Du lịch & Sân bay", labelEn: "Travel" },
  { value: "Work", labelVi: "Công sở & Họp", labelEn: "Work" },
  { value: "IELTS", labelVi: "Luyện thi IELTS", labelEn: "IELTS" },
  { value: "TOEIC", labelVi: "Luyện thi TOEIC", labelEn: "TOEIC" },
  { value: "News", labelVi: "Bản tin thời sự", labelEn: "News" },
  {
    value: "Academic English",
    labelVi: "Tiếng Anh học thuật",
    labelEn: "Academic English",
  },
];

export const DICTATION_LEVELS: Array<{
  value: string;
  labelVi: string;
  labelEn: string;
}> = [
  { value: "ALL", labelVi: "Mọi trình độ", labelEn: "All Levels" },
  {
    value: "Beginner",
    labelVi: "Người mới bắt đầu",
    labelEn: "Beginner",
  },
  { value: "Elementary", labelVi: "Sơ cấp", labelEn: "Elementary" },
  { value: "Intermediate", labelVi: "Trung cấp", labelEn: "Intermediate" },
  {
    value: "Upper Intermediate",
    labelVi: "Trung cấp nâng cao",
    labelEn: "Upper Intermediate",
  },
  { value: "Advanced", labelVi: "Nâng cao", labelEn: "Advanced" },
];

export const DICTATION_STATUSES: Array<{
  value: string;
  labelVi: string;
  labelEn: string;
}> = [
  { value: "ALL", labelVi: "Tất cả trạng thái", labelEn: "All Statuses" },
  {
    value: "Not started",
    labelVi: "Chưa bắt đầu",
    labelEn: "Not started",
  },
  { value: "In progress", labelVi: "Đang học", labelEn: "In progress" },
  { value: "Completed", labelVi: "Đã hoàn thành", labelEn: "Completed" },
];

export const DICTATION_SORTS: Array<{
  value: string;
  labelVi: string;
  labelEn: string;
}> = [
  {
    value: "recent",
    labelVi: "Học gần đây nhất",
    labelEn: "Recently Studied",
  },
  {
    value: "difficulty",
    labelVi: "Độ khó tăng dần",
    labelEn: "Easiest to Hardest",
  },
  {
    value: "progress",
    labelVi: "Tiến độ học tập",
    labelEn: "Study Progress",
  },
  { value: "newest", labelVi: "Bài học mới nhất", labelEn: "Newest First" },
];

export const DEFAULT_WAVEFORM_BARS = [
  12, 20, 34, 46, 30, 22, 38, 44, 26, 18, 30, 42, 46, 34, 20, 14, 24, 36, 44,
  40, 28, 18, 12, 22, 34, 46, 42, 30, 20, 26, 38, 44, 32, 22, 16, 24, 36, 40,
  34, 24, 18, 12, 20, 30, 26, 18, 14, 10,
];
