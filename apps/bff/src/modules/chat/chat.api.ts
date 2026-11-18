import type { BackendClient } from "../../shared/http/backendClient.js";
import { toQueryString } from "../../shared/http/queryParams.js";
import type {
  ChatImageUploadResponse,
  ChatMessageListResponse,
  ChatMessageResponse,
  ChatSocketTicketResponse,
  ChatUnreadCountResponse,
  ConversationPageResponse,
  ConversationSummaryResponse,
  MarkChatReadRequest,
  OpenChatRequest,
  SendChatMessageRequest,
  StartChatImageUploadRequest,
} from "./chat.types.js";

const CHAT_BASE_PATH = "/api/chat";
const CONVERSATIONS_PATH = `${CHAT_BASE_PATH}/conversations`;

type PageParams = { page: number; size: number };

/** `afterSeq` catches up, `beforeSeq` scrolls back, neither gives the newest; both is the backend's 400. */
type HistoryParams = {
  afterSeq?: number | null;
  beforeSeq?: number | null;
  limit: number;
};

const conversationPath = (id: string) =>
  `${CONVERSATIONS_PATH}/${encodeURIComponent(id)}`;

export class ChatApi {
  constructor(private readonly client: BackendClient) {}

  conversations(params: PageParams): Promise<ConversationPageResponse> {
    return this.client.get(`${CONVERSATIONS_PATH}?${toQueryString(params)}`);
  }

  conversation(id: string): Promise<ConversationSummaryResponse> {
    return this.client.get(conversationPath(id));
  }

  messages(
    conversationId: string,
    params: HistoryParams,
  ): Promise<ChatMessageListResponse> {
    return this.client.get(
      `${conversationPath(conversationId)}/messages?${toQueryString(params)}`,
    );
  }

  unreadCount(): Promise<ChatUnreadCountResponse> {
    return this.client.get(`${CHAT_BASE_PATH}/unread-count`);
  }

  /** 200 when the two already had a conversation, 201 when it was created: the same body. */
  open(friendId: string): Promise<ConversationSummaryResponse> {
    const body: OpenChatRequest = { friendId };
    return this.client.post(CONVERSATIONS_PATH, body);
  }

  /** 201 when sent, 200 when this clientId was already sent: the first message comes back. */
  send(
    conversationId: string,
    body: SendChatMessageRequest,
  ): Promise<ChatMessageResponse> {
    return this.client.post(
      `${conversationPath(conversationId)}/messages`,
      body,
    );
  }

  /** 204 */
  async markRead(conversationId: string, upToSeq: number): Promise<void> {
    const body: MarkChatReadRequest = { upToSeq };
    await this.client.post(`${conversationPath(conversationId)}/read`, body);
  }

  recall(messageId: string): Promise<ChatMessageResponse> {
    return this.client.post(
      `${CHAT_BASE_PATH}/messages/${encodeURIComponent(messageId)}/recall`,
    );
  }

  startImageUpload(
    conversationId: string,
    body: StartChatImageUploadRequest,
  ): Promise<ChatImageUploadResponse> {
    return this.client.post(
      `${conversationPath(conversationId)}/image-uploads`,
      body,
    );
  }

  /**
   * A ticket opens one chat socket, once, for 30 seconds. Every call makes a
   * new one, so the answer is never worth keeping: it is not cached, not
   * logged, and the response carries no other use.
   */
  socketTicket(): Promise<ChatSocketTicketResponse> {
    return this.client.post(`${CHAT_BASE_PATH}/socket-tickets`);
  }
}
