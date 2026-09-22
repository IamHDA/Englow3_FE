import { ContentKind, ContentStatus } from "@/lib/graphql/generated";

/**
 * Nhãn, màu và luật hành động của khu quản trị nội dung. Mọi `Record` đều khoá
 * bằng enum sinh ra, nên thêm một trạng thái hay một loại nội dung vào schema
 * là lỗi biên dịch chứ không phải một ô trống lúc chạy.
 */
export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  [ContentStatus.DRAFT]: "Bản nháp",
  [ContentStatus.PENDING_REVIEW]: "Chờ duyệt",
  [ContentStatus.REJECTED]: "Bị trả lại",
  [ContentStatus.PUBLISHED]: "Đã phát hành",
  [ContentStatus.ARCHIVED]: "Đã lưu trữ",
};

export const CONTENT_STATUS_COLORS: Record<ContentStatus, string> = {
  [ContentStatus.DRAFT]: "gray",
  [ContentStatus.PENDING_REVIEW]: "blue",
  // Vàng chứ không đỏ: bị trả lại là một bước bình thường của quy trình, không
  // phải lỗi. Đỏ để dành cho thứ bị hỏng.
  [ContentStatus.REJECTED]: "yellow",
  [ContentStatus.PUBLISHED]: "green",
  [ContentStatus.ARCHIVED]: "orange",
};

export const CONTENT_KIND_LABELS: Record<ContentKind, string> = {
  [ContentKind.FLASHCARD_SET]: "Bộ thẻ từ",
  [ContentKind.QUIZ]: "Bài trắc nghiệm",
  [ContentKind.DICTATION_LESSON]: "Bài nghe chép",
};

/** `itemCount` đếm thứ khác nhau tuỳ loại - "12 thẻ" chứ không phải "12 mục". */
export const CONTENT_ITEM_LABELS: Record<ContentKind, string> = {
  [ContentKind.FLASHCARD_SET]: "thẻ",
  [ContentKind.QUIZ]: "câu hỏi",
  [ContentKind.DICTATION_LESSON]: "câu",
};

/**
 * Hành động hợp lệ ở từng trạng thái. Là bản sao của luật trong entity ở
 * backend và cố ý chỉ dùng để *ẩn* nút - backend vẫn là nơi quyết định. Ẩn một
 * nút chắc chắn bị từ chối thì đỡ cho người dùng một lần thất bại.
 */
export const CONTENT_ACTIONS_BY_STATUS: Record<
  ContentStatus,
  {
    submit: boolean;
    approve: boolean;
    reject: boolean;
    publish: boolean;
    archive: boolean;
  }
> = {
  [ContentStatus.DRAFT]: {
    submit: true,
    approve: false,
    reject: false,
    publish: true,
    archive: true,
  },
  [ContentStatus.PENDING_REVIEW]: {
    submit: false,
    approve: true,
    reject: true,
    publish: false,
    archive: true,
  },
  [ContentStatus.REJECTED]: {
    submit: true,
    approve: false,
    reject: false,
    publish: false,
    archive: true,
  },
  [ContentStatus.PUBLISHED]: {
    submit: false,
    approve: false,
    reject: false,
    publish: false,
    archive: true,
  },
  [ContentStatus.ARCHIVED]: {
    submit: false,
    approve: false,
    reject: false,
    publish: false,
    archive: false,
  },
};

export const ADMIN_CONTENT_PAGE_SIZE = 20;

/**
 * Backend từ chối kèm mã miền ổn định ở `extensions.backendCode`. Ba loại nội
 * dung có mã riêng cho cùng một luật, trừ `REVIEW_NOTE_REQUIRED` - cái đó dùng
 * chung vì luật và câu thông báo y hệt nhau.
 */
export const CONTENT_ERROR_MESSAGES: Record<string, string> = {
  REVIEW_NOTE_REQUIRED: "Phải ghi rõ lý do khi trả lại.",

  FLASHCARD_SET_EMPTY: "Bộ thẻ chưa có thẻ nào.",
  FLASHCARD_SET_NOT_DRAFT: "Chỉ phát hành được bộ thẻ đang là bản nháp.",
  FLASHCARD_SET_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được bộ thẻ đang là bản nháp hoặc bị trả lại.",
  FLASHCARD_SET_NOT_PENDING_REVIEW:
    "Bộ thẻ này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  FLASHCARD_SET_ALREADY_ARCHIVED: "Bộ thẻ này đã được lưu trữ từ trước.",

  QUIZ_EMPTY: "Bài trắc nghiệm chưa có câu hỏi nào.",
  QUIZ_ZERO_POINTS:
    "Mọi câu hỏi đều 0 điểm nên không chấm được. Gán điểm rồi thử lại.",
  QUIZ_NOT_DRAFT: "Chỉ phát hành được bài đang là bản nháp.",
  QUIZ_NOT_EDITABLE: "Chỉ sửa được bài đang là bản nháp hoặc bị trả lại.",
  QUIZ_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được bài đang là bản nháp hoặc bị trả lại.",
  QUIZ_NOT_PENDING_REVIEW:
    "Bài này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  QUIZ_ALREADY_ARCHIVED: "Bài này đã được lưu trữ từ trước.",

  DICTATION_LESSON_EMPTY: "Bài nghe chép chưa có câu nào.",
  DICTATION_LESSON_NOT_DRAFT: "Chỉ phát hành được bài đang là bản nháp.",
  DICTATION_LESSON_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được bài đang là bản nháp hoặc bị trả lại.",
  DICTATION_LESSON_NOT_PENDING_REVIEW:
    "Bài này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  DICTATION_LESSON_ALREADY_ARCHIVED: "Bài này đã được lưu trữ từ trước.",
};

export const CONTENT_GENERIC_ERROR =
  "Thao tác không thành công. Thử lại hoặc kiểm tra quyền truy cập.";
