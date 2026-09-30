import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  UpdateProfileInput,
  UserInformationResponse,
  UserTourStatusResponse,
} from "./user.types.js";

const USER_BASE_PATH = "/api/user";

export class UserApi {
  constructor(private readonly client: BackendClient) {}

  getMe(): Promise<UserInformationResponse> {
    return this.client.get(`${USER_BASE_PATH}/me`);
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
