import type {
  TutorMessageRole,
  TutorMessageStatus,
} from "../../generated/graphql.js";

// mirrors GET /api/tutor/conversations/{id} exactly as the backend returns it
export type TutorMessageResponse = {
  id: string;
  orderNo: number;
  role: TutorMessageRole;
  status: TutorMessageStatus;
  /**
   * Null while a reply is pending. Deliberately not an empty string: the screen
   * has to tell "still thinking" from "answered with nothing", and one value for
   * both makes that impossible.
   */
  content: string | null;
  /** Why no answer came, when none did. Shown instead of a bubble that never fills. */
  errorCode: string | null;
  model: string | null;
  reported: boolean;
  createdAt: string;
  answeredAt: string | null;
};

export type TutorConversationSummaryResponse = {
  id: string;
  title: string;
  topic: string | null;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
};

export type TutorConversationResponse = {
  conversation: TutorConversationSummaryResponse;
  messages: TutorMessageResponse[];
};
