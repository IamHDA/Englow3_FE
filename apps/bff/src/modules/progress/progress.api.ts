import type { BackendClient } from "../../shared/http/backendClient.js";
import type { DailyPathResponse } from "./progress.types.js";

const DAILY_PATH_BASE_PATH = "/api/daily-path";

export class ProgressApi {
  constructor(private readonly client: BackendClient) {}

  /** No parameters: the only path anyone can read is their own, taken from the token. */
  getDailyPath(): Promise<DailyPathResponse> {
    return this.client.get(DAILY_PATH_BASE_PATH);
  }
}
