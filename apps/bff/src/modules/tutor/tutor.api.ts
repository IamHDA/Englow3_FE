import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  SendTutorMessageParams,
  TutorConversationResponse,
  TutorConversationSummaryResponse,
  TutorMessageResponse,
} from "./tutor.types.js";

const TUTOR_BASE_PATH = "/api/tutor";

export class TutorApi {
  constructor(private readonly client: BackendClient) {}

  getConversations(): Promise<TutorConversationSummaryResponse[]> {
    return this.client.get(`${TUTOR_BASE_PATH}/conversations`);
  }

  getConversation(id: string): Promise<TutorConversationResponse> {
    return this.client.get(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(id)}`,
    );
  }

  /**
   * Stores the question and queues the answer. Returns immediately with the
   * pending turn - the screen polls that rather than holding a request open for
   * however long a provider takes.
   */
  sendMessage(
    params: SendTutorMessageParams,
  ): Promise<TutorConversationResponse> {
    return this.client.post(`${TUTOR_BASE_PATH}/messages`, params);
  }

  archiveConversation(
    id: string,
  ): Promise<TutorConversationSummaryResponse> {
    return this.client.delete(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(id)}`,
    );
  }

  reportMessage(
    conversationId: string,
    messageId: string,
    note?: string | null,
  ): Promise<TutorMessageResponse> {
    return this.client.post(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/report`,
      { note: note ?? null },
    );
  }
}
