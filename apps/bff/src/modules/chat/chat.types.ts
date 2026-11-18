import type { paths } from "../../generated/backend-openapi.js";

// mirrors the chat module's REST contract exactly as the backend returns it.

// Springdoc drops `| null` from a field whose type is another record, even when
// the backend marks it nullable: it can only attach `nullable` to a scalar. Two
// fields of ConversationSummaryResponse are in that case, and both are reasserted
// below as what the Java record says (@Schema(nullable = true)):
//   otherUser   - null once the other person erased their account
//   lastMessage - null for a conversation without a message (open returns one)
// The generated type would let a caller read `.otherUser.displayName` without a
// check, which is the crash this override exists to prevent.

// GET /api/chat/conversations/{id}, and POST /api/chat/conversations (200 or 201)
type RawConversationSummaryResponse =
  paths["/api/chat/conversations/{id}"]["get"]["responses"][200]["content"]["application/json"];
export type ConversationSummaryResponse = Omit<
  RawConversationSummaryResponse,
  "otherUser" | "lastMessage"
> & {
  otherUser: RawConversationSummaryResponse["otherUser"] | null;
  lastMessage: RawConversationSummaryResponse["lastMessage"] | null;
};

// GET /api/chat/conversations
type RawConversationPageResponse =
  paths["/api/chat/conversations"]["get"]["responses"][200]["content"]["application/json"];
export type ConversationPageResponse = Omit<
  RawConversationPageResponse,
  "items"
> & { items: ConversationSummaryResponse[] };

// GET /api/chat/conversations/{id}/messages; POST .../messages and
// POST /api/chat/messages/{messageId}/recall answer with one of these.
export type ChatMessageResponse =
  paths["/api/chat/conversations/{id}/messages"]["post"]["responses"][201]["content"]["application/json"];
export type ChatMessageListResponse =
  paths["/api/chat/conversations/{id}/messages"]["get"]["responses"][200]["content"]["application/json"];

// GET /api/chat/unread-count: how many conversations hold something unread.
export type ChatUnreadCountResponse =
  paths["/api/chat/unread-count"]["get"]["responses"][200]["content"]["application/json"];

// POST /api/chat/conversations/{id}/image-uploads. It answers 201, but the
// controller builds that status by hand, so the spec lists only 200 - same body.
export type ChatImageUploadResponse =
  paths["/api/chat/conversations/{id}/image-uploads"]["post"]["responses"][200]["content"]["application/json"];
export type StartChatImageUploadRequest =
  paths["/api/chat/conversations/{id}/image-uploads"]["post"]["requestBody"]["content"]["application/json"];

// POST /api/chat/socket-tickets. Answers 201 with Cache-Control: no-store; the
// spec lists 200 for the same reason as above.
export type ChatSocketTicketResponse =
  paths["/api/chat/socket-tickets"]["post"]["responses"][200]["content"]["application/json"];

export type OpenChatRequest =
  paths["/api/chat/conversations"]["post"]["requestBody"]["content"]["application/json"];
export type SendChatMessageRequest =
  paths["/api/chat/conversations/{id}/messages"]["post"]["requestBody"]["content"]["application/json"];
export type MarkChatReadRequest =
  paths["/api/chat/conversations/{id}/read"]["post"]["requestBody"]["content"]["application/json"];
