import { ExamStatus, FullTestSlot } from "@/lib/graphql/generated";

/** As the web's constants/fullTest.ts. */
export const FULL_TEST_TITLE_MAX_LENGTH = 100;
export const FULL_TEST_DESCRIPTION_MAX_LENGTH = 2000;
export const IELTS_CERTIFICATE = "IELTS";

export const SLOT_TASKS = [
  {
    slot: FullTestSlot.WRITING_TASK_1,
    field: "writingTask1Id",
    skill: "WRITING",
    taskType: "TASK_1",
  },
  {
    slot: FullTestSlot.WRITING_TASK_2,
    field: "writingTask2Id",
    skill: "WRITING",
    taskType: "TASK_2",
  },
  {
    slot: FullTestSlot.SPEAKING_PART_1,
    field: "speakingPart1Id",
    skill: "SPEAKING",
    taskType: "PART_1",
  },
  {
    slot: FullTestSlot.SPEAKING_PART_2,
    field: "speakingPart2Id",
    skill: "SPEAKING",
    taskType: "PART_2",
  },
  {
    slot: FullTestSlot.SPEAKING_PART_3,
    field: "speakingPart3Id",
    skill: "SPEAKING",
    taskType: "PART_3",
  },
] as const;

export const FULL_TEST_ERRORS: Record<string, string> = {
  EXAM_BLUEPRINT_INVALID:
    "Kiểm tra số phần, số điểm, passage, audio và thời lượng của đề trước khi gửi duyệt.",
  FULL_TEST_VARIANT_UNSUPPORTED: "Hiện chỉ hỗ trợ full test IELTS Academic.",
  FULL_TEST_CHANGED:
    "Full test đã được thay đổi ở nơi khác. Tải lại danh sách trước khi lưu để tránh ghi đè.",
  CONTENT_VERSION_REQUIRED: "Tải lại full test trước khi chỉnh sửa.",
  FULL_TEST_PAPER_NOT_BANDABLE:
    "Đề cần đủ 40 điểm mỗi kỹ năng Listening/Reading và bảng quy đổi band tương ứng. Hãy kiểm tra lại đề trước khi gửi duyệt.",
  FULL_TEST_PAPER_INVALID:
    "Đề Listening + Reading phải là đề thi thử IELTS đã phát hành, cùng loại Academic/General và có cả hai phần.",
  FULL_TEST_TASK_INVALID:
    "Mỗi phần Writing/Speaking phải là đề IELTS đã phát hành, đúng kỹ năng và dạng bài.",
  FULL_TEST_TASK1_NEEDS_CHART:
    "Writing Task 1 của full test Academic phải có ảnh biểu đồ.",
  FULL_TEST_NOT_EDITABLE:
    "Chỉ sửa được full test ở trạng thái nháp hoặc bị trả lại.",
};

export const CONTENT_STATUS_LABELS: Record<ExamStatus, string> = {
  [ExamStatus.DRAFT]: "Bản nháp",
  [ExamStatus.PENDING_REVIEW]: "Chờ duyệt",
  [ExamStatus.PUBLISHED]: "Đã xuất bản",
  [ExamStatus.REJECTED]: "Bị trả lại",
  [ExamStatus.ARCHIVED]: "Lưu trữ",
};

export const CONTENT_STATUS_TONE: Record<
  ExamStatus,
  "neutral" | "accent" | "success" | "danger" | "primary"
> = {
  [ExamStatus.DRAFT]: "neutral",
  [ExamStatus.PENDING_REVIEW]: "accent",
  [ExamStatus.PUBLISHED]: "success",
  [ExamStatus.REJECTED]: "danger",
  [ExamStatus.ARCHIVED]: "neutral",
};
