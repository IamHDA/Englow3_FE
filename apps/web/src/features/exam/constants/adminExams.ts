import { ExamStatus, ExamType } from "@/lib/graphql/generated";

/**
 * Nhãn và màu của từng trạng thái đề. `Record` khoá bằng enum sinh ra, nên
 * thêm một trạng thái mới vào schema là lỗi biên dịch chứ không phải một ô
 * trống lúc chạy.
 */
export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  [ExamStatus.DRAFT]: "Bản nháp",
  [ExamStatus.PENDING_REVIEW]: "Chờ duyệt",
  [ExamStatus.REJECTED]: "Bị trả lại",
  [ExamStatus.PUBLISHED]: "Đã phát hành",
  [ExamStatus.ARCHIVED]: "Đã lưu trữ",
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
  EXAM_NOT_EDITABLE: "Chỉ sửa được đề đang là bản nháp hoặc bị trả lại.",
  EXAM_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được đề đang là bản nháp hoặc bị trả lại.",
  EXAM_NOT_PENDING_REVIEW:
    "Đề này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  EXAM_REVIEW_NOTE_REQUIRED: "Phải ghi rõ lý do khi trả lại đề.",
  EXAM_SCORE_MISMATCH:
    "Tổng điểm các phần không khớp thang điểm tối đa của đề. Sửa lại rồi phát hành.",
  EXAM_EMPTY: "Đề chưa có phần hoặc câu hỏi nào.",
  EXAM_HAS_NO_SECTION: "Đề chưa có phần nào.",
  EXAM_HAS_NO_QUESTION: "Đề chưa có câu hỏi nào.",
  EXAM_UNGRADEABLE_QUESTION:
    "Có câu hỏi chưa chấm được (thiếu đáp án đúng hoặc thiếu điểm).",
  EXAM_ALREADY_ARCHIVED: "Đề này đã được lưu trữ từ trước.",
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
  },
};

export const ADMIN_EXAM_GENERIC_ERROR =
  "Thao tác không thành công. Thử lại hoặc kiểm tra quyền truy cập.";
