import type {
  AssessmentAttemptFieldsFragment,
  AssessmentTaskFieldsFragment,
} from "@/lib/graphql/generated";
export type PracticeTask = AssessmentTaskFieldsFragment;
export type PracticeAttempt = AssessmentAttemptFieldsFragment;
export type Criterion = {
  key: string;
  score: number;
  feedback: string;
  quote?: string;
  audioStart?: number;
  audioEnd?: number;
};
export type PracticeReport = {
  overall: number;
  criteria: Criterion[];
  summary: string;
  strengths: string[];
  improvements: string[];
  estimated: true;
};
export const criterionLabels: Record<string, string> = {
  TASK_RESPONSE: "Đáp ứng yêu cầu đề",
  COHERENCE_COHESION: "Mạch lạc và liên kết",
  LEXICAL_RESOURCE: "Từ vựng",
  GRAMMATICAL_RANGE: "Ngữ pháp",
  FLUENCY_COHERENCE: "Trôi chảy và mạch lạc",
  PRONUNCIATION: "Phát âm",
};
export function criteriaFor(skill: string) {
  return skill === "WRITING"
    ? [
        "TASK_RESPONSE",
        "COHERENCE_COHESION",
        "LEXICAL_RESOURCE",
        "GRAMMATICAL_RANGE",
      ]
    : [
        "FLUENCY_COHERENCE",
        "LEXICAL_RESOURCE",
        "GRAMMATICAL_RANGE",
        "PRONUNCIATION",
      ];
}
export const statusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING_REVIEW: "Chờ duyệt đề",
  REJECTED: "Cần chỉnh sửa",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
  QUEUED: "AI đang chấm",
  NEEDS_REVIEW: "Chờ giáo viên chấm",
  COMPLETED: "Đã có kết quả",
  FAILED: "Chấm chưa thành công",
};
export const statusLabelsEn: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Awaiting approval",
  REJECTED: "Changes requested",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
  QUEUED: "Awaiting AI assessment",
  NEEDS_REVIEW: "Awaiting teacher review",
  COMPLETED: "Result ready",
  FAILED: "Assessment failed",
};
export function parseReport(value?: string | null): PracticeReport | null {
  if (!value) return null;
  try {
    const r = JSON.parse(value);
    return typeof r.overall === "number" &&
      Array.isArray(r.criteria) &&
      r.criteria.length === 4 &&
      typeof r.summary === "string" &&
      Array.isArray(r.strengths) &&
      Array.isArray(r.improvements) &&
      Number.isFinite(r.overall) &&
      r.overall >= 0 &&
      r.overall <= 9 &&
      r.criteria.every(
        (c: Criterion) =>
          c &&
          typeof c.key === "string" &&
          typeof c.feedback === "string" &&
          Number.isFinite(c.score) &&
          c.score >= 0 &&
          c.score <= 9,
      ) &&
      r.strengths.every((s: unknown) => typeof s === "string") &&
      r.improvements.every((s: unknown) => typeof s === "string")
      ? r
      : null;
  } catch {
    return null;
  }
}
export const wordCount = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;
