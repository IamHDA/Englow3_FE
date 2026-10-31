import type { QuerySpeakingPromptsArgs } from "../../generated/graphql.js";
import type { BackendClient } from "../../shared/http/backendClient.js";
import { toQueryString } from "../../shared/http/queryParams.js";
import type {
  SpeakingAttemptResponse,
  SpeakingPromptPageResponse,
  SpeakingPromptResponse,
  SpeakingUploadTicketResponse,
} from "./speaking.types.js";

const SPEAKING_BASE_PATH = "/api/speaking";

export class SpeakingApi {
  constructor(private readonly client: BackendClient) {}

  searchPrompts(
    params: QuerySpeakingPromptsArgs,
  ): Promise<SpeakingPromptPageResponse> {
    const query = toQueryString({
      category: params.category,
      title: params.title,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return this.client.get(`${SPEAKING_BASE_PATH}/prompts?${query}`);
  }

  getPrompt(id: string): Promise<SpeakingPromptResponse> {
    return this.client.get(
      `${SPEAKING_BASE_PATH}/prompts/${encodeURIComponent(id)}`,
    );
  }

  /**
   * Opens an attempt and returns somewhere to PUT the recording. The audio goes
   * from the browser straight to object storage - it never passes through here.
   */
  startAttempt(
    promptId: string,
    contentType: string,
    contentLength: number,
  ): Promise<SpeakingUploadTicketResponse> {
    return this.client.post(
      `${SPEAKING_BASE_PATH}/prompts/${encodeURIComponent(promptId)}/attempts`,
      { contentType, contentLength },
    );
  }

  /** The upload is done. Refused by the backend if the recording is not actually there. */
  submitAttempt(attemptId: string): Promise<SpeakingAttemptResponse> {
    return this.client.post(
      `${SPEAKING_BASE_PATH}/attempts/${encodeURIComponent(attemptId)}/submit`,
    );
  }

  getAttempt(attemptId: string): Promise<SpeakingAttemptResponse> {
    return this.client.get(
      `${SPEAKING_BASE_PATH}/attempts/${encodeURIComponent(attemptId)}`,
    );
  }

  getAttemptHistory(promptId: string): Promise<SpeakingAttemptResponse[]> {
    return this.client.get(
      `${SPEAKING_BASE_PATH}/prompts/${encodeURIComponent(promptId)}/attempts`,
    );
  }
}
