import { ExamStatus, ExamType } from "@/lib/graphql/generated";

/**
 * Nhãn và màu của từng trạng thái đề. `Record` khoá bằng enum sinh ra, nên
 * thêm một trạng thái mới vào schema là lỗi biên dịch chứ không phải một ô
 * trống lúc chạy.
 */
export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  [ExamStatus.DRAFT]: "Bản nháp",
  [ExamStatus.PUBLISHED]: "Đã phát hành",
  [ExamStatus.ARCHIVED]: "Đã lưu trữ",
};

export const EXAM_STATUS_COLORS: Record<ExamStatus, string> = {
  [ExamStatus.DRAFT]: "gray",
  [ExamStatus.PUBLISHED]: "green",
  [ExamStatus.ARCHIVED]: "orange",
};

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  [ExamType.MOCK]: "Thi thử",
  [ExamType.PLACEMENT]: "Xếp trình độ",
};

export const ADMIN_EXAMS_PAGE_SIZE = 20;

/**
 * Backend từ chối phát hành kèm mã miền ổn định ở `extensions.backendCode` -
 * dịch sang lời đọc được thay vì hiện thông báo gốc của server.
 */
export const ADMIN_EXAM_ERROR_MESSAGES: Record<string, string> = {
  EXAM_NOT_DRAFT: "Chỉ phát hành được đề đang ở trạng thái bản nháp.",
  EXAM_SCORE_MISMATCH:
    "Tổng điểm các phần không khớp thang điểm tối đa của đề. Sửa lại rồi phát hành.",
  EXAM_EMPTY: "Đề chưa có phần hoặc câu hỏi nào.",
  EXAM_UNGRADEABLE_QUESTION:
    "Có câu hỏi chưa chấm được (thiếu đáp án đúng hoặc thiếu điểm).",
  EXAM_ALREADY_ARCHIVED: "Đề này đã được lưu trữ từ trước.",
};

export const ADMIN_EXAM_GENERIC_ERROR =
  "Thao tác không thành công. Thử lại hoặc kiểm tra quyền truy cập.";
