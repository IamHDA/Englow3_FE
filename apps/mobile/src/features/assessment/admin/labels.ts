/** Task states as the web's assessment types name them. */
export const TASK_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING_REVIEW: "Chờ duyệt đề",
  REJECTED: "Cần chỉnh sửa",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
};

export const TASK_ERRORS: Record<string, string> = {
  FULL_TEST_COMPONENT_IN_USE:
    "Đề đang thuộc full test chờ duyệt, đã phát hành hoặc còn người đang thi. Lưu trữ full test và chờ các lượt thi kết thúc trước.",
  TASK_PURPOSE_SKILL: "Chỉ đề Nói mới dùng được cho bài đo trình độ.",
};
