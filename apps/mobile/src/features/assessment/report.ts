import {
  AssessmentAttemptStatus,
  AssessmentSkill,
} from "@/lib/graphql/generated";

/** The AI/teacher report, stored as JSON. Same shape and checks as the web's parseReport. */
export type Criterion = {
  key: string;
  score?: number;
  feedback: string;
  quote?: string;
};

export type AssessmentReport = {
  overall: number;
  criteria: Criterion[];
  summary: string;
  strengths: string[];
  improvements: string[];
  scoresHidden?: boolean;
  focusCriterion?: string;
};

export function parseReport(value?: string | null): AssessmentReport | null {
  if (!value) return null;
  try {
    const r = JSON.parse(value);
    const scoreOk = (c: Criterion) =>
      r.scoresHidden === true && c.score === undefined
        ? true
        : Number.isFinite(c.score) &&
          (c.score as number) >= 0 &&
          (c.score as number) <= 9;
    return typeof r.overall === "number" &&
      Number.isFinite(r.overall) &&
      r.overall >= 0 &&
      r.overall <= 9 &&
      Array.isArray(r.criteria) &&
      r.criteria.length === 4 &&
      typeof r.summary === "string" &&
      Array.isArray(r.strengths) &&
      Array.isArray(r.improvements) &&
      r.criteria.every(
        (c: Criterion) =>
          c &&
          typeof c.key === "string" &&
          typeof c.feedback === "string" &&
          scoreOk(c),
      ) &&
      r.strengths.every((s: unknown) => typeof s === "string") &&
      r.improvements.every((s: unknown) => typeof s === "string")
      ? (r as AssessmentReport)
      : null;
  } catch {
    return null;
  }
}

export const CRITERION_LABELS: Record<string, string> = {
  TASK_RESPONSE: "Đáp ứng yêu cầu đề",
  COHERENCE_COHESION: "Mạch lạc và liên kết",
  LEXICAL_RESOURCE: "Từ vựng",
  GRAMMATICAL_RANGE: "Ngữ pháp",
  FLUENCY_COHERENCE: "Trôi chảy và mạch lạc",
  PRONUNCIATION: "Phát âm",
};

export const ATTEMPT_STATUS_LABELS: Record<AssessmentAttemptStatus, string> = {
  [AssessmentAttemptStatus.DRAFT]: "Bản nháp",
  [AssessmentAttemptStatus.QUEUED]: "AI đang chấm",
  [AssessmentAttemptStatus.NEEDS_REVIEW]: "Chờ giáo viên chấm",
  [AssessmentAttemptStatus.COMPLETED]: "Đã có kết quả",
  [AssessmentAttemptStatus.FAILED]: "Chấm chưa thành công",
};

export function skillLabel(skill: AssessmentSkill): string {
  return skill === AssessmentSkill.WRITING ? "Viết" : "Nói";
}

export function taskTypeLabel(taskType: string): string {
  const spaced = taskType.replaceAll("_", " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export const wordCount = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;
