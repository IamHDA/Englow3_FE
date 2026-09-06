// Exam-domain enums. Deliberately not shared with the user/onboarding domain:
// the backend keeps com.englow3.exam.entity.CertificateType separate from
// com.englow3.user.entity.CertificateType because there the value is a
// learner's goal, here it is one half of what identifies a paper.
export type ExamStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ExamType = "PLACEMENT" | "MOCK";
export type CertificateType = "IELTS" | "TOEIC";
export type CertificateVariant = "LR" | "SW" | "ACADEMIC" | "GENERAL";
export type TargetLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

// mirrors GET /api/admin/exams exactly as the backend returns it
export type ExamListItemResponse = {
  id: string;
  title: string;
  examType: ExamType;
  certificateType: CertificateType;
  certificateVariant: CertificateVariant;
  targetLevel: TargetLevel;
  status: ExamStatus;
  versionNumber: number;
  createdByUserId: string;
  publishedAt: string | null; // ISO-8601 instant, null until published
  createdAt: string; // ISO-8601 instant
};

// mirrors com.englow3.shared.page.PageResponse exactly as the backend returns it
export type ExamPageResponse = {
  items: ExamListItemResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

/** Every filter is optional - an absent one is not a filter, matching SearchExamRequest. */
export type SearchExamsParams = {
  status?: ExamStatus;
  examType?: ExamType;
  title?: string;
  page?: number;
  size?: number;
};
