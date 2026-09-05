import type { OnboardingStep } from "../user/user.types.js";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type LearningSkill =
  | "LISTENING"
  | "READING"
  | "WRITING"
  | "SPEAKING"
  | "GRAMMAR"
  | "VOCABULARY"
  | "PRONUNCIATION";

// mirrors GET /api/onboarding/current-state exactly as the backend returns it.
// `step` is recorded here for completeness but not exposed on OnboardingState -
// Me.onboardingStep is the single GraphQL source of truth, see onboarding.typeDefs.ts.
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
