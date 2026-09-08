import type {
  CertificateType,
  CertificateVariant,
  TargetLevel,
} from "@/lib/graphql/generated/schemaTypes";

export type ExamTypeTab = {
  id: string;
  name: string;
  certificateType?: CertificateType;
  certificateVariant?: CertificateVariant;
};

export const EXAM_TYPE_TABS: ExamTypeTab[] = [
  { id: "all", name: "Tất cả đề thi" },
  {
    id: "toeic_lr",
    name: "TOEIC L&R",
    certificateType: "TOEIC" as CertificateType,
    certificateVariant: "LR" as CertificateVariant,
  },
  {
    id: "toeic_sw",
    name: "TOEIC S&W",
    certificateType: "TOEIC" as CertificateType,
    certificateVariant: "SW" as CertificateVariant,
  },
  {
    id: "ielts_academic",
    name: "IELTS Academic",
    certificateType: "IELTS" as CertificateType,
    certificateVariant: "ACADEMIC" as CertificateVariant,
  },
  {
    id: "ielts_general",
    name: "IELTS General",
    certificateType: "IELTS" as CertificateType,
    certificateVariant: "GENERAL" as CertificateVariant,
  },
];

export type FilterOption<T> = {
  value: T | "ALL";
  label: string;
};

export const SKILL_OPTIONS: FilterOption<string>[] = [
  { value: "ALL", label: "Kỹ năng: Tất cả" },
  { value: "LISTENING", label: "Listening" },
  { value: "READING", label: "Reading" },
  { value: "WRITING", label: "Writing" },
  { value: "SPEAKING", label: "Speaking" },
];

export const DIFFICULTY_OPTIONS: FilterOption<TargetLevel>[] = [
  { value: "ALL", label: "Độ khó: Tất cả" },
  { value: "A1" as TargetLevel, label: "A1 — Cơ bản" },
  { value: "A2" as TargetLevel, label: "A2 — Sơ cấp" },
  { value: "B1" as TargetLevel, label: "B1 — Trung cấp" },
  { value: "B2" as TargetLevel, label: "B2 — Trung cao cấp" },
  { value: "C1" as TargetLevel, label: "C1 — Cao cấp" },
  { value: "C2" as TargetLevel, label: "C2 — Thành thạo" },
];

export const STATUS_OPTIONS: FilterOption<string>[] = [
  { value: "ALL", label: "Trạng thái: Tất cả" },
  { value: "NOT_STARTED", label: "Chưa làm" },
  { value: "IN_PROGRESS", label: "Đang làm dở" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
];

export type SortKey = "NEWEST" | "LEVEL_ASC" | "LEVEL_DESC" | "SCORE_DESC";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "NEWEST", label: "Mới nhất" },
  { value: "LEVEL_ASC", label: "Độ khó: Dễ → Khó" },
  { value: "LEVEL_DESC", label: "Độ khó: Khó → Dễ" },
  { value: "SCORE_DESC", label: "Điểm cao nhất" },
];

export function getExamTypeTabs(allExamsLabel?: string): ExamTypeTab[] {
  return [
    { id: "all", name: allExamsLabel || "Tất cả đề thi" },
    {
      id: "toeic_lr",
      name: "TOEIC L&R",
      certificateType: "TOEIC" as CertificateType,
      certificateVariant: "LR" as CertificateVariant,
    },
    {
      id: "toeic_sw",
      name: "TOEIC S&W",
      certificateType: "TOEIC" as CertificateType,
      certificateVariant: "SW" as CertificateVariant,
    },
    {
      id: "ielts_academic",
      name: "IELTS Academic",
      certificateType: "IELTS" as CertificateType,
      certificateVariant: "ACADEMIC" as CertificateVariant,
    },
    {
      id: "ielts_general",
      name: "IELTS General",
      certificateType: "IELTS" as CertificateType,
      certificateVariant: "GENERAL" as CertificateVariant,
    },
  ];
}

export function getSkillOptions(allSkillLabel?: string): FilterOption<string>[] {
  return [
    { value: "ALL", label: allSkillLabel || "Kỹ năng: Tất cả" },
    { value: "LISTENING", label: "Listening" },
    { value: "READING", label: "Reading" },
    { value: "WRITING", label: "Writing" },
    { value: "SPEAKING", label: "Speaking" },
  ];
}

export function getDifficultyOptions(
  allDiffLabel?: string,
  isVi: boolean = true,
): FilterOption<TargetLevel>[] {
  return [
    { value: "ALL", label: allDiffLabel || "Độ khó: Tất cả" },
    { value: "A1" as TargetLevel, label: isVi ? "A1 — Cơ bản" : "A1 — Beginner" },
    { value: "A2" as TargetLevel, label: isVi ? "A2 — Sơ cấp" : "A2 — Elementary" },
    { value: "B1" as TargetLevel, label: isVi ? "B1 — Trung cấp" : "B1 — Intermediate" },
    { value: "B2" as TargetLevel, label: isVi ? "B2 — Trung cao cấp" : "B2 — Upper-Intermediate" },
    { value: "C1" as TargetLevel, label: isVi ? "C1 — Cao cấp" : "C1 — Advanced" },
    { value: "C2" as TargetLevel, label: isVi ? "C2 — Thành thạo" : "C2 — Proficiency" },
  ];
}

export function getStatusOptions(
  allStatusLabel?: string,
  notStartedLabel?: string,
  inProgressLabel?: string,
  completedLabel?: string,
): FilterOption<string>[] {
  return [
    { value: "ALL", label: allStatusLabel || "Trạng thái: Tất cả" },
    { value: "NOT_STARTED", label: notStartedLabel || "Chưa làm" },
    { value: "IN_PROGRESS", label: inProgressLabel || "Đang làm dở" },
    { value: "COMPLETED", label: completedLabel || "Đã hoàn thành" },
  ];
}

export function getSortOptions(
  newestLabel?: string,
  levelAscLabel?: string,
  levelDescLabel?: string,
  scoreDescLabel?: string,
): { value: SortKey; label: string }[] {
  return [
    { value: "NEWEST", label: newestLabel || "Mới nhất" },
    { value: "LEVEL_ASC", label: levelAscLabel || "Độ khó: Dễ → Khó" },
    { value: "LEVEL_DESC", label: levelDescLabel || "Độ khó: Khó → Dễ" },
    { value: "SCORE_DESC", label: scoreDescLabel || "Điểm cao nhất" },
  ];
}

export const CEFR_COLOR_MAP: Record<
  string,
  { bg: string; fg: string; border: string }
> = {
  A1: { bg: "#EEF2FF", fg: "#3730A3", border: "#C7D2FE" },
  A2: { bg: "#ECFDF5", fg: "#065F46", border: "#A7F3D0" },
  B1: { bg: "#F0F9FF", fg: "#0369A1", border: "#BAE6FD" },
  B2: { bg: "#FEF3C7", fg: "#92400E", border: "#FDE68A" },
  C1: { bg: "#FCE7F3", fg: "#9D174D", border: "#FBCFE8" },
  C2: { bg: "#F3E8FF", fg: "#6B21A8", border: "#E9D5FF" },
};
