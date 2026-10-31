import type {
  TutorMessageRole,
  TutorMessageStatus,
} from "../../generated/graphql.js";
import type { paths } from "../../generated/backend-openapi.js";

type RawTutorConversation =
  paths["/api/tutor/conversations/{id}"]["get"]["responses"][200]["content"]["application/json"];
type RawTutorMessage = RawTutorConversation["messages"][number];

export type TutorConversationSummaryResponse =
  paths["/api/tutor/conversations"]["get"]["responses"][200]["content"]["application/json"][number] & {
    archivedAt?: string | null;
    useLearningContext: boolean;
    quizAttemptId?: string | null;
    quizQuestionId?: string | null;
    assessmentAttemptId?: string | null;
    examAttemptId?: string | null;
    examQuestionId?: string | null;
  };

/**
 * The backend serialises `role`/`status` with `message.getRole().name()` onto
 * a plain `String` component (see TutorMessageResult.java), so OpenAPI can
 * only say `string` - reasserted here as the real, fixed-value domain enum.
 */
export type TutorMessageResponse = Omit<RawTutorMessage, "role" | "status"> & {
  role: TutorMessageRole;
  status: TutorMessageStatus;
  revision: number;
  restartCount: number;
  correction?: string | null;
  reportStatus?: string | null;
  sources: {
    label: string;
    resourceId: string;
    title: string;
    versionNumber: number;
    excerpt: string;
  }[];
};

// mirrors GET /api/tutor/conversations/{id} exactly as the backend returns it -
// also the shape POST /api/tutor/messages answers with (queues the reply and
// hands back the conversation so far).
export type TutorConversationResponse = Omit<
  RawTutorConversation,
  "messages" | "conversation"
> & {
  conversation: TutorConversationSummaryResponse;
  messages: TutorMessageResponse[];
};

export interface TutorUsageResponse {
  enabled: boolean;
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string;
  maxMessageLength: number;
  streaming: boolean;
  voice: boolean;
  allowedModes?: string[];
  supportedContexts?: string[];
  memorySupported?: boolean;
}
export interface TutorHistoryResponse {
  items: TutorConversationSummaryResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
export interface TutorMessagesResponse extends TutorConversationResponse {
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface TutorResourceResponse {
  id: string;
  documentId: string;
  versionNumber: number;
  title: string;
  body: string;
  status: string;
  authorId: string;
  reviewNote?: string | null;
  rowVersion: number;
}
export interface TutorReportResponse {
  id: string;
  messageId: string;
  revision: number;
  question?: string | null;
  answer?: string | null;
  learnerNote?: string | null;
  status: string;
  assignedTo?: string | null;
  reviewerNote?: string | null;
  correction?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}
export interface TutorPageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
