import { GenerationStatus } from "@/lib/graphql/generated/schemaTypes";

type Copy = { vi: string; en: string };

/** Longest author's brief the backend stores. */
export const BRIEF_MAX_LENGTH = 1000;

/** How often the page looks again while a request is running. */
export const GENERATION_POLL_MS = 5_000;

/** What each step does, as the progress line says it. */
export const STEP_COPY: Record<string, Copy> = {
  plan: { vi: "Lên chủ đề", en: "Planning topics" },
  "listening-1": {
    vi: "Viết Listening Part 1",
    en: "Writing Listening Part 1",
  },
  "listening-2": {
    vi: "Viết Listening Part 2",
    en: "Writing Listening Part 2",
  },
  "listening-3": {
    vi: "Viết Listening Part 3",
    en: "Writing Listening Part 3",
  },
  "listening-4": {
    vi: "Viết Listening Part 4",
    en: "Writing Listening Part 4",
  },
  "reading-1": {
    vi: "Viết Reading Passage 1",
    en: "Writing Reading Passage 1",
  },
  "reading-2": {
    vi: "Viết Reading Passage 2",
    en: "Writing Reading Passage 2",
  },
  "reading-3": {
    vi: "Viết Reading Passage 3",
    en: "Writing Reading Passage 3",
  },
  "writing-1": { vi: "Viết Writing Task 1", en: "Writing Task 1" },
  "writing-2": { vi: "Viết Writing Task 2", en: "Writing Task 2" },
  speaking: { vi: "Viết đề Speaking", en: "Writing the Speaking test" },
  assemble: {
    vi: "Dựng bộ đề và tạo bản nháp",
    en: "Building the set as drafts",
  },
  chart: { vi: "Gắn biểu đồ Task 1", en: "Attaching the Task 1 chart" },
  "audio-1": {
    vi: "Thu âm Listening Part 1",
    en: "Recording Listening Part 1",
  },
  "audio-2": {
    vi: "Thu âm Listening Part 2",
    en: "Recording Listening Part 2",
  },
  "audio-3": {
    vi: "Thu âm Listening Part 3",
    en: "Recording Listening Part 3",
  },
  "audio-4": {
    vi: "Thu âm Listening Part 4",
    en: "Recording Listening Part 4",
  },
  finish: { vi: "Gửi duyệt và tạo full test", en: "Sending for review" },
};

export const STATUS_COPY: Record<GenerationStatus, Copy & { color: string }> = {
  [GenerationStatus.QUEUED]: { vi: "Đang chờ", en: "Queued", color: "gray" },
  [GenerationStatus.RUNNING]: { vi: "Đang tạo", en: "Running", color: "blue" },
  [GenerationStatus.COMPLETED]: {
    vi: "Xong, chờ duyệt",
    en: "Done, awaiting review",
    color: "teal",
  },
  [GenerationStatus.FAILED]: { vi: "Hỏng", en: "Failed", color: "red" },
};

/** Why the backend refused to start a request. */
export const REFUSAL_COPY: Record<string, Copy> = {
  GENERATION_DAILY_LIMIT: {
    vi: "Bạn đã dùng hết lượt tạo đề hôm nay. Lượt hỏng không bị tính.",
    en: "You have used today's requests. Failed ones do not count.",
  },
  GENERATION_IN_PROGRESS: {
    vi: "Bạn đang có một lượt chưa xong. Đợi nó xong rồi tạo tiếp.",
    en: "One of your requests is still running. Wait for it to finish.",
  },
};

/** Why a request stopped, in words an author can act on. */
export const FAILURE_COPY: Record<string, Copy> = {
  GENERATION_STEP_FAILED: {
    vi: "AI viết sai luật 3 lần liền ở bước này. Thử lại, hoặc nới yêu cầu riêng nếu nó đòi điều luật không cho.",
    en: "The model broke the rules three times at this step. Try again, or loosen a brief that asks for something the rules forbid.",
  },
  AI_GENERATION_DISABLED: {
    vi: "Chưa cấu hình model tạo đề trên AI service (AI_SERVICE_GENERATION_*).",
    en: "The generation model is not configured on the AI service (AI_SERVICE_GENERATION_*).",
  },
};
