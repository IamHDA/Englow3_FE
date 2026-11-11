import {
  FullTestPartGrading,
  FullTestSittingStatus,
  FullTestSlot,
} from "@/lib/graphql/generated/schemaTypes";

type Copy = { vi: string; en: string };

/** What each Writing and Speaking part is called, and where it is answered. */
export const SLOT_COPY: Record<FullTestSlot, Copy & { path: string }> = {
  [FullTestSlot.WRITING_TASK_1]: {
    vi: "Writing Task 1",
    en: "Writing Task 1",
    path: "/study/writing",
  },
  [FullTestSlot.WRITING_TASK_2]: {
    vi: "Writing Task 2",
    en: "Writing Task 2",
    path: "/study/writing",
  },
  [FullTestSlot.SPEAKING_PART_1]: {
    vi: "Speaking Part 1",
    en: "Speaking Part 1",
    path: "/study/speaking",
  },
  [FullTestSlot.SPEAKING_PART_2]: {
    vi: "Speaking Part 2",
    en: "Speaking Part 2",
    path: "/study/speaking",
  },
  [FullTestSlot.SPEAKING_PART_3]: {
    vi: "Speaking Part 3",
    en: "Speaking Part 3",
    path: "/study/speaking",
  },
};

export const STATUS_COPY: Record<
  FullTestSittingStatus,
  Copy & { color: string }
> = {
  [FullTestSittingStatus.IN_PROGRESS]: {
    vi: "Đang làm",
    en: "In progress",
    color: "blue",
  },
  [FullTestSittingStatus.AWAITING_GRADES]: {
    vi: "Đang chờ chấm",
    en: "Waiting for grades",
    color: "yellow",
  },
  [FullTestSittingStatus.COMPLETED]: {
    vi: "Đã có band",
    en: "Band ready",
    color: "green",
  },
  [FullTestSittingStatus.EXPIRED]: {
    vi: "Hết hạn",
    en: "Expired",
    color: "gray",
  },
};

/** Refused by the backend for a learner not preparing for IELTS. */
export const IELTS_ONLY_CODE = "FULL_TEST_IELTS_ONLY";

/** How often an open sitting looks again for grades that have landed. */
export const SITTING_POLL_MS = 30_000;

/** Longest title and description the backend stores for a full test. */
export const FULL_TEST_TITLE_MAX_LENGTH = 100;
export const FULL_TEST_DESCRIPTION_MAX_LENGTH = 2000;

/** The certificate a full test belongs to, as the catalogue names it. */
export const IELTS_CERTIFICATE = "IELTS";

/** Which task fills each Writing and Speaking slot of a full test. */
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

/** Why the backend refuses to send a full test for review, in the author's words. */
export const FULL_TEST_ERROR_COPY: Record<string, Copy> = {
  EXAM_BLUEPRINT_INVALID: {
    vi: "Kiểm tra số phần, số điểm, passage, audio và thời lượng của đề trước khi gửi duyệt.",
    en: "Check part counts, marks, passages, audio and section times before submitting for review.",
  },
  FULL_TEST_VARIANT_UNSUPPORTED: {
    vi: "Hiện chỉ hỗ trợ full test IELTS Academic.",
    en: "Only IELTS Academic full tests are currently supported.",
  },
  FULL_TEST_CHANGED: {
    vi: "Full test đã được thay đổi ở nơi khác. Tải lại danh sách trước khi lưu để tránh ghi đè.",
    en: "This full test changed elsewhere. Reload the list before saving to avoid overwriting changes.",
  },
  CONTENT_VERSION_REQUIRED: {
    vi: "Tải lại full test trước khi chỉnh sửa.",
    en: "Reload the full test before editing.",
  },
  FULL_TEST_PAPER_NOT_BANDABLE: {
    vi: "Đề cần đủ 40 điểm mỗi kỹ năng Listening/Reading và bảng quy đổi band tương ứng. Hãy kiểm tra lại đề trước khi gửi duyệt.",
    en: "The paper needs 40 marks in each skill and a matching IELTS band conversion. Check it before submitting.",
  },
  FULL_TEST_PAPER_INVALID: {
    vi: "Đề Listening + Reading phải là đề thi thử IELTS đã phát hành, cùng loại Academic/General và có cả hai phần.",
    en: "The Listening + Reading paper must be a published IELTS mock of the same variant, with both sections.",
  },
  FULL_TEST_TASK_INVALID: {
    vi: "Mỗi phần Writing/Speaking phải là đề IELTS đã phát hành, đúng kỹ năng và dạng bài.",
    en: "Each Writing and Speaking part must be a published IELTS task of the right skill and type.",
  },
  FULL_TEST_TASK1_NEEDS_CHART: {
    vi: "Writing Task 1 của full test Academic phải có ảnh biểu đồ.",
    en: "An Academic full test's Writing Task 1 needs its chart.",
  },
  FULL_TEST_NOT_EDITABLE: {
    vi: "Chỉ sửa được full test ở trạng thái nháp hoặc bị trả lại.",
    en: "Only a draft or returned full test can be edited.",
  },
};

/** How grading of a handed-in part stands, as the sitting page says it. */
export const GRADING_COPY: Record<
  FullTestPartGrading,
  Copy & { color: string }
> = {
  [FullTestPartGrading.GRADING]: {
    vi: "Đã nộp · đang chấm",
    en: "Handed in · being graded",
    color: "blue",
  },
  [FullTestPartGrading.AWAITING_REVIEW]: {
    vi: "Đã nộp · chờ giáo viên chấm",
    en: "Handed in · waiting for a teacher",
    color: "yellow",
  },
  [FullTestPartGrading.FAILED]: {
    vi: "Chấm tự động bị lỗi · cần chấm lại",
    en: "Automatic grading failed · resend it",
    color: "red",
  },
  [FullTestPartGrading.GRADED]: {
    vi: "Đã có điểm",
    en: "Graded",
    color: "teal",
  },
};

/** Where a Writing or Speaking answer is read, resent or sent to a teacher. */
export const attemptPath = (attemptId: string) =>
  `/study/assessments/attempts/${attemptId}`;
