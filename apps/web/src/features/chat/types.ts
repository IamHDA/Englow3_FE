import type {
  ChatConversationFieldsFragment,
  ChatConversationQuery,
  ChatMessageFieldsFragment,
} from "@/lib/graphql/generated";

/** One row of the conversation list. */
export type ConversationItem = ChatConversationFieldsFragment;

/** One conversation as asked for by itself: the row, plus whether the viewer may still write. */
export type ConversationDetail = ChatConversationQuery["chatConversation"];

/** A message as the backend says it - a REST answer, a history page or a socket frame. */
export type ChatMessageData = ChatMessageFieldsFragment;
