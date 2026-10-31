import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  LearningPurposeResponse,
  OnboardingStateResponse,
  SelectLearningPurposesRequest,
  SelectTargetSkillsRequest,
  SetCertificateTargetRequest,
  SetCurrentLevelRequest,
  SetLearningGoalRequest,
} from "./onboarding.types.js";

const ONBOARDING_BASE_PATH = "/api/onboarding";

export class OnboardingApi {
  constructor(private readonly client: BackendClient) {}

  getCurrentState(): Promise<OnboardingStateResponse> {
    return this.client.get(`${ONBOARDING_BASE_PATH}/current-state`);
  }

  getLearningPurposes(): Promise<LearningPurposeResponse[]> {
    return this.client.get(`${ONBOARDING_BASE_PATH}/learning-purposes`);
  }

  selectLearningPurposes(
    body: SelectLearningPurposesRequest,
  ): Promise<OnboardingStateResponse> {
    return this.client.put(`${ONBOARDING_BASE_PATH}/learning-purposes`, body);
  }

  setCertificateTarget(
    body: SetCertificateTargetRequest,
  ): Promise<OnboardingStateResponse> {
    return this.client.put(`${ONBOARDING_BASE_PATH}/certificate-target`, body);
  }

  setCurrentLevel(
    body: SetCurrentLevelRequest,
  ): Promise<OnboardingStateResponse> {
    return this.client.put(`${ONBOARDING_BASE_PATH}/current-level`, body);
  }

  setLearningGoal(
    body: SetLearningGoalRequest,
  ): Promise<OnboardingStateResponse> {
    return this.client.put(`${ONBOARDING_BASE_PATH}/learning-goal`, body);
  }

  selectTargetSkills(
    body: SelectTargetSkillsRequest,
  ): Promise<OnboardingStateResponse> {
    return this.client.put(`${ONBOARDING_BASE_PATH}/target-skills`, body);
  }

  complete(): Promise<OnboardingStateResponse> {
    return this.client.post(`${ONBOARDING_BASE_PATH}/complete`);
  }
}
