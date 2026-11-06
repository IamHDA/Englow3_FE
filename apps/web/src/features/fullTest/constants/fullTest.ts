import {
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
