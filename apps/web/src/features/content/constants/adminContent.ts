import { ContentKind, ContentStatus } from "@/lib/graphql/generated";

/**
 * Nhãn, màu và luật hành động của khu quản trị nội dung. Mọi `Record` đều khoá
 * bằng enum sinh ra, nên thêm một trạng thái hay một loại nội dung vào schema
 * là lỗi biên dịch chứ không phải một ô trống lúc chạy.
 */
type Words = { vi: string; en: string };

export const CONTENT_STATUS_LABELS: Record<ContentStatus, Words> = {
  [ContentStatus.DRAFT]: { vi: "Bản nháp", en: "Draft" },
  [ContentStatus.PENDING_REVIEW]: { vi: "Chờ duyệt", en: "Awaiting review" },
  [ContentStatus.REJECTED]: { vi: "Bị trả lại", en: "Returned" },
  [ContentStatus.PUBLISHED]: { vi: "Đã phát hành", en: "Published" },
  [ContentStatus.ARCHIVED]: { vi: "Đã lưu trữ", en: "Archived" },
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

export const CONTENT_KIND_LABELS: Record<ContentKind, Words> = {
  [ContentKind.FLASHCARD_SET]: { vi: "Bộ thẻ từ", en: "Flashcard sets" },
  [ContentKind.QUIZ]: { vi: "Bài trắc nghiệm", en: "Quizzes" },
  [ContentKind.DICTATION_LESSON]: { vi: "Bài nghe chép", en: "Dictation" },
  [ContentKind.SPEAKING_PROMPT]: { vi: "Câu luyện nói", en: "Pronunciation" },
};

/**
 * `itemCount` đếm thứ khác nhau tuỳ loại - "12 thẻ" chứ không phải "12 mục".
 *
 * Câu luyện nói không có nhãn vì không có gì để đếm: nó là một câu, không phải
 * một tập hợp. Backend trả null và bảng hiện dấu gạch ngang.
 */
export const CONTENT_ITEM_LABELS: Record<ContentKind, Words | null> = {
  [ContentKind.FLASHCARD_SET]: { vi: "thẻ", en: "cards" },
  [ContentKind.QUIZ]: { vi: "câu hỏi", en: "questions" },
  [ContentKind.DICTATION_LESSON]: { vi: "câu", en: "sentences" },
  [ContentKind.SPEAKING_PROMPT]: null,
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
    restore?: boolean;
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
    restore: true,
  },
};

export const ADMIN_CONTENT_PAGE_SIZE = 20;

/**
 * Backend từ chối kèm mã miền ổn định ở `extensions.backendCode`. Bốn loại nội
 * dung có mã riêng cho cùng một luật, trừ `REVIEW_NOTE_REQUIRED` - cái đó dùng
 * chung vì luật và câu thông báo y hệt nhau.
 */
export const CONTENT_ERROR_MESSAGES: Record<string, Words> = {
  REVIEW_NOTE_REQUIRED: {
    vi: "Phải ghi rõ lý do khi trả lại.",
    en: "A reason is required when returning it.",
  },

  FLASHCARD_SET_EMPTY: {
    vi: "Bộ thẻ chưa có thẻ nào.",
    en: "The set has no cards yet.",
  },
  FLASHCARD_SET_NOT_DRAFT: {
    vi: "Bộ thẻ này không còn là bản nháp nên không phát hành hay nhập thêm được.",
    en: "This set is no longer a draft, so it cannot be published or imported into.",
  },
  FLASHCARD_SET_NOT_EDITABLE: {
    vi: "Bộ thẻ đang chờ duyệt hoặc đã lưu trữ nên không thêm thẻ được.",
    en: "The set is awaiting review or archived, so cards cannot be added.",
  },
  FLASHCARD_SET_LIVE_ADMIN_ONLY: {
    vi: "Bộ thẻ đã phát hành - chỉ quản trị viên được thêm thẻ.",
    en: "The set is published - only an administrator can add cards.",
  },
  FLASHCARD_SET_NOT_SUBMITTABLE: {
    vi: "Chỉ gửi duyệt được bộ thẻ đang là bản nháp hoặc bị trả lại.",
    en: "Only a draft or returned set can be submitted.",
  },
  FLASHCARD_SET_NOT_PENDING_REVIEW: {
    vi: "Bộ thẻ này không còn chờ duyệt - có thể ai đó vừa xử lý.",
    en: "This set is no longer awaiting review - someone may have just handled it.",
  },
  FLASHCARD_SET_ALREADY_ARCHIVED: {
    vi: "Bộ thẻ này đã được lưu trữ từ trước.",
    en: "This set was already archived.",
  },
  FLASHCARD_SET_NOT_ARCHIVED: {
    vi: "Chỉ khôi phục được bộ thẻ đã lưu trữ.",
    en: "Only an archived set can be restored.",
  },

  QUIZ_EMPTY: {
    vi: "Bài trắc nghiệm chưa có câu hỏi nào.",
    en: "The quiz has no questions yet.",
  },
  QUIZ_ZERO_POINTS: {
    vi: "Mọi câu hỏi đều 0 điểm nên không chấm được. Gán điểm rồi thử lại.",
    en: "Every question is worth 0 points, so it cannot be scored. Assign points and try again.",
  },
  QUIZ_NOT_DRAFT: {
    vi: "Chỉ phát hành được bài đang là bản nháp.",
    en: "Only a draft can be published.",
  },
  QUIZ_NOT_EDITABLE: {
    vi: "Chỉ sửa được bài đang là bản nháp hoặc bị trả lại.",
    en: "Only a draft or returned quiz can be edited.",
  },
  QUIZ_NOT_SUBMITTABLE: {
    vi: "Chỉ gửi duyệt được bài đang là bản nháp hoặc bị trả lại.",
    en: "Only a draft or returned quiz can be submitted.",
  },
  QUIZ_NOT_PENDING_REVIEW: {
    vi: "Bài này không còn chờ duyệt - có thể ai đó vừa xử lý.",
    en: "This quiz is no longer awaiting review - someone may have just handled it.",
  },
  QUIZ_ALREADY_ARCHIVED: {
    vi: "Bài này đã được lưu trữ từ trước.",
    en: "This quiz was already archived.",
  },
  QUIZ_NOT_ARCHIVED: {
    vi: "Chỉ khôi phục được bài đã lưu trữ.",
    en: "Only an archived quiz can be restored.",
  },

  DICTATION_LESSON_EMPTY: {
    vi: "Bài nghe chép chưa có câu nào.",
    en: "The lesson has no sentences yet.",
  },
  DICTATION_LESSON_NOT_DRAFT: {
    vi: "Chỉ phát hành được bài đang là bản nháp.",
    en: "Only a draft can be published.",
  },
  DICTATION_LESSON_NOT_EDITABLE: {
    vi: "Bài đang chờ duyệt hoặc đã lưu trữ nên không thêm câu được.",
    en: "The lesson is awaiting review or archived, so sentences cannot be added.",
  },
  DICTATION_LESSON_LIVE_ADMIN_ONLY: {
    vi: "Bài đã phát hành - chỉ quản trị viên được thêm câu.",
    en: "The lesson is published - only an administrator can add sentences.",
  },
  DICTATION_LESSON_NOT_SUBMITTABLE: {
    vi: "Chỉ gửi duyệt được bài đang là bản nháp hoặc bị trả lại.",
    en: "Only a draft or returned lesson can be submitted.",
  },
  DICTATION_LESSON_NOT_PENDING_REVIEW: {
    vi: "Bài này không còn chờ duyệt - có thể ai đó vừa xử lý.",
    en: "This lesson is no longer awaiting review - someone may have just handled it.",
  },
  DICTATION_LESSON_ALREADY_ARCHIVED: {
    vi: "Bài này đã được lưu trữ từ trước.",
    en: "This lesson was already archived.",
  },
  DICTATION_LESSON_NOT_ARCHIVED: {
    vi: "Chỉ khôi phục được bài đã lưu trữ.",
    en: "Only an archived lesson can be restored.",
  },

  SPEAKING_PROMPT_NO_REFERENCE_TEXT: {
    vi: "Câu luyện nói phải có câu mẫu để người học đọc theo.",
    en: "A speaking prompt needs a model sentence for the learner to read.",
  },
  SPEAKING_PROMPT_NOT_DRAFT: {
    vi: "Chỉ phát hành được câu đang là bản nháp.",
    en: "Only a draft can be published.",
  },
  SPEAKING_PROMPT_NOT_SUBMITTABLE: {
    vi: "Chỉ gửi duyệt được câu đang là bản nháp hoặc bị trả lại.",
    en: "Only a draft or returned prompt can be submitted.",
  },
  SPEAKING_PROMPT_NOT_PENDING_REVIEW: {
    vi: "Câu này không còn chờ duyệt - có thể ai đó vừa xử lý.",
    en: "This prompt is no longer awaiting review - someone may have just handled it.",
  },
  SPEAKING_PROMPT_ALREADY_ARCHIVED: {
    vi: "Câu này đã được lưu trữ từ trước.",
    en: "This prompt was already archived.",
  },
  SPEAKING_PROMPT_NOT_ARCHIVED: {
    vi: "Chỉ khôi phục được câu đã lưu trữ.",
    en: "Only an archived prompt can be restored.",
  },
};

export const CONTENT_GENERIC_ERROR: Words = {
  vi: "Thao tác không thành công. Thử lại hoặc kiểm tra quyền truy cập.",
  en: "That did not work. Try again or check your access.",
};
