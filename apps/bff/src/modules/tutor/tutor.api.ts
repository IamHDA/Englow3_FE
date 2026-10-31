import type { MutationSendTutorMessageArgs } from "../../generated/graphql.js";
import type { BackendClient } from "../../shared/http/backendClient.js";
import { BackendError } from "../../shared/http/backendError.js";
import type {
  TutorConversationResponse,
  TutorConversationSummaryResponse,
  TutorMessageResponse,
  TutorResourceResponse,
  TutorReportResponse,
  TutorPageResponse,
  TutorUsageResponse,
  TutorHistoryResponse,
  TutorMessagesResponse,
} from "./tutor.types.js";

const TUTOR_BASE_PATH = "/api/tutor";

export class TutorApi {
  constructor(private readonly client: BackendClient) {}
  memory(
    conversation: string,
  ): Promise<import("../../generated/graphql.js").TutorMemory> {
    return this.client.get(
      `/api/tutor/conversations/${encodeURIComponent(conversation)}/memory`,
    );
  }
  summarize(
    conversation: string,
    clientMessageId: string,
  ): Promise<TutorConversationResponse> {
    return this.client.post(
      `/api/tutor/conversations/${encodeURIComponent(conversation)}/memory/summarize`,
      { clientMessageId },
    );
  }
  async clearMemory(conversation: string): Promise<boolean> {
    const path = `/api/tutor/conversations/${encodeURIComponent(conversation)}/memory`;
    const start = Date.now();
    const response = await this.client.send("DELETE", path);
    if (!response.ok)
      throw await BackendError.fromResponse(
        response,
        "DELETE",
        path,
        Date.now() - start,
      );
    return true;
  }
  policy(): Promise<import("../../generated/graphql.js").TutorPolicy> {
    return this.client.get("/api/admin/tutor/policy");
  }
  updatePolicy(
    input: import("../../generated/graphql.js").TutorPolicyInput,
  ): Promise<import("../../generated/graphql.js").TutorPolicy> {
    return this.client.put("/api/admin/tutor/policy", input);
  }
  operations(): Promise<{
    pending: number;
    running: number;
    completedToday: number;
    failedToday: number;
    oldestPendingAt?: string | null;
    scope: string;
    metrics?: {
      samples: number;
      queueP95Ms?: number | null;
      completionP95Ms?: number | null;
      knownInputTokens: number;
      knownOutputTokens: number;
      unknownUsageJobs: number;
      failures: { code: string; count: number }[];
    } | null;
  }> {
    return this.client.get("/api/admin/tutor/operations");
  }
  resources(
    status: string,
    page: number,
  ): Promise<TutorPageResponse<TutorResourceResponse>> {
    return this.client.get(
      `/api/admin/tutor/resources?${new URLSearchParams({ status, page: String(page), size: "15" })}`,
    );
  }
  resource(id: string): Promise<TutorResourceResponse> {
    return this.client.get(
      `/api/admin/tutor/resources/${encodeURIComponent(id)}`,
    );
  }
  createResource(input: {
    title: string;
    body: string;
    rowVersion?: number | null;
  }): Promise<TutorResourceResponse> {
    return this.client.post("/api/admin/tutor/resources", {
      ...input,
      rowVersion: input.rowVersion ?? 0,
    });
  }
  updateResource(
    id: string,
    input: { title: string; body: string; rowVersion?: number | null },
  ): Promise<TutorResourceResponse> {
    return this.client.put(
      `/api/admin/tutor/resources/${encodeURIComponent(id)}`,
      { ...input, rowVersion: input.rowVersion ?? 0 },
    );
  }
  resourceAction(id: string, input: object): Promise<TutorResourceResponse> {
    return this.client.post(
      `/api/admin/tutor/resources/${encodeURIComponent(id)}/actions`,
      input,
    );
  }
  reports(
    status: string,
    page: number,
  ): Promise<TutorPageResponse<TutorReportResponse>> {
    return this.client.get(
      `/api/admin/tutor/reports?${new URLSearchParams({ status, page: String(page), size: "15" })}`,
    );
  }
  report(id: string): Promise<TutorReportResponse> {
    return this.client.get(
      `/api/admin/tutor/reports/${encodeURIComponent(id)}`,
    );
  }
  reportAction(id: string, input: object): Promise<TutorReportResponse> {
    return this.client.post(
      `/api/admin/tutor/reports/${encodeURIComponent(id)}/actions`,
      input,
    );
  }
  staff(): Promise<{ id: string; displayName: string }[]> {
    return this.client.get("/api/admin/tutor/staff");
  }

  replyHistory(
    conversationId: string,
    messageId: string,
  ): Promise<{
    currentRevision: number;
    canSelect: boolean;
    items: {
      revision: number;
      status: string;
      content?: string | null;
      model?: string | null;
    }[];
  }> {
    return this.client.get(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/versions`,
    );
  }
  selectReply(
    conversationId: string,
    messageId: string,
    revision: number,
    clientMessageId: string,
  ): Promise<TutorConversationResponse> {
    return this.client.post(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/select`,
      { revision, clientMessageId },
    );
  }
  branch(
    conversationId: string,
    messageId: string,
    message: string,
    clientMessageId: string,
    personalized?: boolean | null,
  ): Promise<TutorConversationResponse> {
    return this.client.post(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/branch`,
      { message, clientMessageId, personalized },
    );
  }
  async getUsage(): Promise<
    TutorUsageResponse & {
      allowedModes: string[];
      supportedContexts: string[];
      memorySupported: boolean;
    }
  > {
    const usage = await this.client.get<TutorUsageResponse>(
      `${TUTOR_BASE_PATH}/usage`,
    );
    return {
      ...usage,
      supportedContexts: usage.supportedContexts ?? [],
      memorySupported: usage.memorySupported ?? false,
      allowedModes: usage.allowedModes ?? [
        "GENERAL",
        "CORRECTION",
        "CONVERSATION",
        "PRACTICE",
      ],
    };
  }
  getReceipt(id: string): Promise<TutorConversationResponse> {
    return this.client.get(
      `${TUTOR_BASE_PATH}/requests/${encodeURIComponent(id)}`,
    );
  }
  getHistory(
    page = 0,
    size = 20,
    search = "",
    archived = false,
  ): Promise<TutorHistoryResponse> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      search,
      archived: String(archived),
    });
    return this.client.get(`${TUTOR_BASE_PATH}/history?${params}`);
  }
  getMessages(id: string, page = 0, size = 30): Promise<TutorMessagesResponse> {
    return this.client.get(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(id)}/messages?page=${page}&size=${size}`,
    );
  }
  getReply(
    conversationId: string,
    messageId: string,
  ): Promise<TutorMessageResponse> {
    return this.client.get(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
    );
  }
  restart(
    conversationId: string,
    messageId: string,
    clientMessageId: string,
    regenerate: boolean,
  ): Promise<TutorConversationResponse> {
    return this.client.post(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/${regenerate ? "regenerate" : "retry"}`,
      { clientMessageId },
    );
  }
  cancel(
    conversationId: string,
    messageId: string,
  ): Promise<TutorMessageResponse> {
    return this.client.post(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/cancel`,
      {},
    );
  }
  restoreConversation(id: string): Promise<TutorConversationSummaryResponse> {
    return this.client.post(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(id)}/restore`,
      {},
    );
  }
  renameConversation(
    id: string,
    title: string,
  ): Promise<TutorConversationSummaryResponse> {
    return this.client.put(
      `${TUTOR_BASE_PATH}/conversations/${encodeURIComponent(id)}/title`,
      { title },
    );
  }

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
    params: MutationSendTutorMessageArgs,
  ): Promise<TutorConversationResponse> {
    return this.client.post(`${TUTOR_BASE_PATH}/messages`, params);
  }

  archiveConversation(id: string): Promise<TutorConversationSummaryResponse> {
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
