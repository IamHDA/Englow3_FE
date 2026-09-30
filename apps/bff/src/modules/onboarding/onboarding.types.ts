import type { paths } from "../../generated/backend-openapi.js";

// mirrors GET /api/onboarding/current-state exactly as the backend returns it.
// Every write endpoint under /api/onboarding answers with this same shape.
export type OnboardingStateResponse =
  paths["/api/onboarding/current-state"]["get"]["responses"][200]["content"]["application/json"];

export type LearningPurposeResponse =
  paths["/api/onboarding/learning-purposes"]["get"]["responses"][200]["content"]["application/json"][number];

export type SelectLearningPurposesRequest =
  paths["/api/onboarding/learning-purposes"]["put"]["requestBody"]["content"]["application/json"];

export type SetCertificateTargetRequest =
  paths["/api/onboarding/certificate-target"]["put"]["requestBody"]["content"]["application/json"];

export type SetCurrentLevelRequest =
  paths["/api/onboarding/current-level"]["put"]["requestBody"]["content"]["application/json"];

export type SetLearningGoalRequest =
  paths["/api/onboarding/learning-goal"]["put"]["requestBody"]["content"]["application/json"];

export type SelectTargetSkillsRequest =
  paths["/api/onboarding/target-skills"]["put"]["requestBody"]["content"]["application/json"];
