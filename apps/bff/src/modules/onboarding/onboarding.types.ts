import type { OnboardingStep } from "../user/user.types.js";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type TargetCertificate = "IELTS" | "TOEIC";

export type LearningSkill =
  | "LISTENING"
  | "READING"
  | "WRITING"
  | "SPEAKING"
  | "GRAMMAR"
  | "VOCABULARY"
  | "PRONUNCIATION";

// mirrors GET /api/onboarding/current-state exactly as the backend returns it.
// Every write endpoint under /api/onboarding answers with this same shape.
export type OnboardingStateResponse = {
  step: OnboardingStep;
  learningPurposeIds: number[] | null;
  certificateLearner: boolean | null;
  targetCertificateType: string | null;
  currentLevel: CefrLevel | null;
  targetScore: number | null;
  targetDate: string | null; // "YYYY-MM-DD"
  targetSkills: LearningSkill[] | null;
};

// mirrors GET /api/onboarding/learning-purposes exactly as the backend
// returns it. `purposeCode` is a table row, not a closed set (ids are
// non-contiguous - 1..5, 11), so it stays a string rather than a GraphQL enum.
export type LearningPurposeResponse = {
  id: number;
  purposeCode: string;
  displayName: string;
};

// mirrors PUT /api/onboarding/learning-purposes request body
export type SelectLearningPurposesRequest = {
  purposeIds: number[];
};

// mirrors PUT /api/onboarding/certificate-target request body
export type SetCertificateTargetRequest = {
  certificateType: TargetCertificate;
};

// mirrors PUT /api/onboarding/current-level request body
export type SetCurrentLevelRequest = {
  level: CefrLevel;
};

// mirrors PUT /api/onboarding/learning-goal request body. The backend also
// accepts `currentScore`, which no screen collects today.
export type SetLearningGoalRequest = {
  certificateType: TargetCertificate;
  targetScore?: number | null;
  targetDate?: string | null; // "YYYY-MM-DD"
};

// mirrors PUT /api/onboarding/target-skills request body
export type SelectTargetSkillsRequest = {
  skills: LearningSkill[];
};
