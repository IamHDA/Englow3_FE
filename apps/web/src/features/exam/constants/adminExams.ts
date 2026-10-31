import { ExamStatus, ExamType } from "@/lib/graphql/generated";

/**
 * Nhãn và màu của từng trạng thái đề. `Record` khoá bằng enum sinh ra, nên
 * thêm một trạng thái mới vào schema là lỗi biên dịch chứ không phải một ô
 * trống lúc chạy.
 */
type Words = { vi: string; en: string };

export const EXAM_STATUS_LABELS: Record<ExamStatus, Words> = {
  [ExamStatus.DRAFT]: { vi: "Bản nháp", en: "Draft" },
  [ExamStatus.PENDING_REVIEW]: { vi: "Chờ duyệt", en: "Awaiting review" },
  [ExamStatus.REJECTED]: { vi: "Bị trả lại", en: "Returned" },
  [ExamStatus.PUBLISHED]: { vi: "Đã phát hành", en: "Published" },
  [ExamStatus.ARCHIVED]: { vi: "Đã lưu trữ", en: "Archived" },
};

export const EXAM_STATUS_COLORS: Record<ExamStatus, string> = {
  [ExamStatus.DRAFT]: "gray",
  [ExamStatus.PENDING_REVIEW]: "blue",
  // Cam vàng chứ không đỏ: bị trả lại là một bước bình thường trong quy trình,
  // không phải lỗi hệ thống. Đỏ dành cho thứ bị hỏng.
  [ExamStatus.REJECTED]: "yellow",
  [ExamStatus.PUBLISHED]: "green",
  [ExamStatus.ARCHIVED]: "orange",
};

export const EXAM_TYPE_LABELS: Record<ExamType, Words> = {
  [ExamType.MOCK]: { vi: "Thi thử", en: "Mock test" },
  [ExamType.PLACEMENT]: { vi: "Xếp trình độ", en: "Placement" },
};

export const ADMIN_EXAMS_PAGE_SIZE = 20;

/**
 * Backend từ chối phát hành kèm mã miền ổn định ở `extensions.backendCode` -
 * dịch sang lời đọc được thay vì hiện thông báo gốc của server.
 */
export const ADMIN_EXAM_ERROR_MESSAGES: Record<string, Words> = {
  EXAM_NOT_DRAFT: {
    vi: "Chỉ phát hành được đề đang ở trạng thái bản nháp.",
    en: "Only a draft exam can be published.",
  },
  EXAM_NOT_EDITABLE: {
    vi: "Chỉ sửa được đề đang là bản nháp hoặc bị trả lại.",
    en: "Only a draft or returned exam can be edited.",
  },
  STORAGE_UNAVAILABLE: {
    vi: "Kho lưu trữ tệp đang lỗi. Thử tải lên lại sau ít phút.",
    en: "File storage is failing. Try the upload again in a few minutes.",
  },
  EXAM_NOT_SUBMITTABLE: {
    vi: "Chỉ gửi duyệt được đề đang là bản nháp hoặc bị trả lại.",
    en: "Only a draft or returned exam can be submitted.",
  },
  EXAM_NOT_PENDING_REVIEW: {
    vi: "Đề này không còn chờ duyệt - có thể ai đó vừa xử lý.",
    en: "This exam is no longer awaiting review - someone may have just handled it.",
  },
  EXAM_REVIEW_NOTE_REQUIRED: {
    vi: "Phải ghi rõ lý do khi trả lại đề.",
    en: "A reason is required when returning an exam.",
  },
  EXAM_PRODUCTIVE_SECTION: {
    vi: "Đề có phần Writing/Speaking nên không phát hành được: đề thi thử chỉ chấm trắc nghiệm. Soạn Writing/Speaking ở mục Writing & Speaking.",
    en: "This paper has a Writing/Speaking section, so it cannot be published: mock exams score choice questions only. Use Writing & Speaking instead.",
  },
  EXAM_SCORE_MISMATCH: {
    vi: "Tổng điểm các phần không khớp thang điểm tối đa của đề. Sửa lại rồi phát hành.",
    en: "The section scores do not add up to the exam maximum. Fix them, then publish.",
  },
  EXAM_EMPTY: {
    vi: "Đề chưa có phần hoặc câu hỏi nào.",
    en: "The exam has no sections or questions yet.",
  },
  EXAM_HAS_NO_SECTION: {
    vi: "Đề chưa có phần nào.",
    en: "The exam has no sections yet.",
  },
  EXAM_HAS_NO_QUESTION: {
    vi: "Đề chưa có câu hỏi nào.",
    en: "The exam has no questions yet.",
  },
  EXAM_UNGRADEABLE_QUESTION: {
    vi: "Có câu hỏi chưa chấm được (thiếu đáp án đúng hoặc thiếu điểm).",
    en: "A question cannot be scored yet (no correct answer or no points).",
  },
  EXAM_ALREADY_ARCHIVED: {
    vi: "Đề này đã được lưu trữ từ trước.",
    en: "This exam was already archived.",
  },
  EXAM_NOT_ARCHIVED: {
    vi: "Chỉ khôi phục được đề đã lưu trữ.",
    en: "Only an archived exam can be restored.",
  },
};

/**
 * Hành động hợp lệ ở từng trạng thái. Khoá bằng enum sinh ra nên thêm trạng
 * thái mới vào schema là lỗi biên dịch, không phải một hàng nút bấm im lặng
 * không làm gì.
 *
 * Đây là bản sao của luật trong entity ở backend, và cố ý chỉ dùng để *ẩn* nút
 * - backend vẫn là nơi quyết định. Ẩn một nút chắc chắn sẽ bị từ chối thì đỡ
 * cho người dùng một lần thất bại; còn hiện một nút mà backend cho qua thì
 * không gây hại gì.
 */
export const EXAM_ACTIONS_BY_STATUS: Record<
  ExamStatus,
  {
    submit: boolean;
    approve: boolean;
    reject: boolean;
    publish: boolean;
    archive: boolean;
    restore?: boolean;
  }
> = {
  [ExamStatus.DRAFT]: {
    submit: true,
    approve: false,
    reject: false,
    publish: true,
    archive: true,
  },
  [ExamStatus.PENDING_REVIEW]: {
    submit: false,
    approve: true,
    reject: true,
    publish: false,
    archive: true,
  },
  [ExamStatus.REJECTED]: {
    submit: true,
    approve: false,
    reject: false,
    publish: false,
    archive: true,
  },
  [ExamStatus.PUBLISHED]: {
    submit: false,
    approve: false,
    reject: false,
    publish: false,
    archive: true,
  },
  [ExamStatus.ARCHIVED]: {
    submit: false,
    approve: false,
    reject: false,
    publish: false,
    archive: false,
    restore: true,
  },
};

export const ADMIN_EXAM_GENERIC_ERROR: Words = {
  vi: "Thao tác không thành công. Thử lại hoặc kiểm tra quyền truy cập.",
  en: "That did not work. Try again or check your access.",
};
