import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  SearchSpeakingPromptsParams,
  SpeakingAttemptResponse,
  SpeakingPromptPageResponse,
  SpeakingPromptResponse,
  SpeakingUploadTicketResponse,
} from "./speaking.types.js";

const SPEAKING_BASE_PATH = "/api/speaking";

export class SpeakingApi {
  constructor(private readonly client: BackendClient) {}

  searchPrompts(
    params: SearchSpeakingPromptsParams,
  ): Promise<SpeakingPromptPageResponse> {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.title) query.set("title", params.title);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    return this.client.get(`${SPEAKING_BASE_PATH}/prompts?${query.toString()}`);
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
