import {
  FullTestPartGrading,
  FullTestSittingStatus,
  FullTestSlot,
} from "@/lib/graphql/generated";

export const SLOT_LABELS: Record<
  FullTestSlot,
  { title: string; skill: "WRITING" | "SPEAKING" }
> = {
  [FullTestSlot.WRITING_TASK_1]: { title: "Writing Task 1", skill: "WRITING" },
  [FullTestSlot.WRITING_TASK_2]: { title: "Writing Task 2", skill: "WRITING" },
  [FullTestSlot.SPEAKING_PART_1]: {
    title: "Speaking Part 1",
    skill: "SPEAKING",
  },
  [FullTestSlot.SPEAKING_PART_2]: {
    title: "Speaking Part 2",
    skill: "SPEAKING",
  },
  [FullTestSlot.SPEAKING_PART_3]: {
    title: "Speaking Part 3",
    skill: "SPEAKING",
  },
};

export const SITTING_STATUS: Record<
  FullTestSittingStatus,
  { label: string; tone: "accent" | "primary" | "success" | "danger" }
> = {
  [FullTestSittingStatus.IN_PROGRESS]: { label: "Đang làm", tone: "accent" },
  [FullTestSittingStatus.AWAITING_GRADES]: {
    label: "Chờ chấm điểm",
    tone: "primary",
  },
  [FullTestSittingStatus.COMPLETED]: {
    label: "Đã có kết quả",
    tone: "success",
  },
  [FullTestSittingStatus.EXPIRED]: { label: "Đã hết hạn", tone: "danger" },
};

export const GRADING_LABELS: Record<FullTestPartGrading, string> = {
  [FullTestPartGrading.GRADING]: "Đang chấm",
  [FullTestPartGrading.AWAITING_REVIEW]: "Chờ giáo viên",
  [FullTestPartGrading.GRADED]: "Đã chấm",
  [FullTestPartGrading.FAILED]: "Chấm lỗi",
};

export function isFullTestSlot(
  value: string | undefined,
): value is FullTestSlot {
  return (
    value !== undefined &&
    (Object.values(FullTestSlot) as string[]).includes(value)
  );
}
