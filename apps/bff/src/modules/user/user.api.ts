import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  UpdateProfileInput,
  UserInformationResponse,
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
}
