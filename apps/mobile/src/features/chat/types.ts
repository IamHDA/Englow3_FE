import type {
  ChatConversationFieldsFragment,
  ChatMessageFieldsFragment,
} from "@/lib/graphql/generated";

export type ChatMessageData = ChatMessageFieldsFragment;
export type ConversationItem = ChatConversationFieldsFragment;
