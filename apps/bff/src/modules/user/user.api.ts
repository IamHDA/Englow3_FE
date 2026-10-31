import type { UpdateProfileInput } from "../../generated/graphql.js";
import type { BackendClient } from "../../shared/http/backendClient.js";
import { BackendError } from "../../shared/http/backendError.js";
import type {
  UserInformationResponse,
  UserTourStatusResponse,
  UserBootstrapResponse,
} from "./user.types.js";

const USER_BASE_PATH = "/api/user";

export class UserApi {
  constructor(private readonly client: BackendClient) {}

  async getMe(): Promise<UserInformationResponse> {
    try {
      const bootstrap = await this.client.get<UserBootstrapResponse>(
        `${USER_BASE_PATH}/me/bootstrap`,
      );
      return {
        ...bootstrap.user,
        onboardingState: bootstrap.onboardingState ?? null,
      };
    } catch (error) {
      // Mixed-version rollout only. Do not amplify authentication failures or outages with retries.
      if (
        !(error instanceof BackendError) ||
        !(
          (error.status === 404 && error.code !== "USER_NOT_FOUND") ||
          error.status === 405
        )
      )
        throw error;
      return this.client.get(`${USER_BASE_PATH}/me`);
    }
  }

  updateProfile(input: UpdateProfileInput): Promise<UserInformationResponse> {
    return this.client.put(`${USER_BASE_PATH}/me/profile`, input);
  }

  getTourStatus(): Promise<UserTourStatusResponse> {
    return this.client.get(`${USER_BASE_PATH}/me/tour`);
  }

  completeTour(): Promise<UserTourStatusResponse> {
    return this.client.put(`${USER_BASE_PATH}/me/tour`, {});
  }
}
