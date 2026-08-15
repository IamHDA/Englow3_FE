import type { BackendClient } from "../../shared/http/backendClient.js";
import type { OnboardingStateResponse } from "./onboarding.types.js";

const ONBOARDING_BASE_PATH = "/api/onboarding";

export class OnboardingApi {
  constructor(private readonly client: BackendClient) {}

  getCurrentState(): Promise<OnboardingStateResponse> {
    return this.client.get(`${ONBOARDING_BASE_PATH}/current-state`);
  }
}
