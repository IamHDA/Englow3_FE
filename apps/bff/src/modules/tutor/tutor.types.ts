import type {
  TutorMessageRole,
  TutorMessageStatus,
} from "../../generated/graphql.js";
import type { paths } from "../../generated/backend-openapi.js";

type RawTutorConversation =
  paths["/api/tutor/conversations/{id}"]["get"]["responses"][200]["content"]["application/json"];
type RawTutorMessage = RawTutorConversation["messages"][number];

export type TutorConversationSummaryResponse =
  paths["/api/tutor/conversations"]["get"]["responses"][200]["content"]["application/json"][number];

/**
 * The backend serialises `role`/`status` with `message.getRole().name()` onto
 * a plain `String` component (see TutorMessageResult.java), so OpenAPI can
 * only say `string` - reasserted here as the real, fixed-value domain enum.
 */
export type TutorMessageResponse = Omit<RawTutorMessage, "role" | "status"> & {
  role: TutorMessageRole;
  status: TutorMessageStatus;
};

// mirrors GET /api/tutor/conversations/{id} exactly as the backend returns it -
// also the shape POST /api/tutor/messages answers with (queues the reply and
// hands back the conversation so far).
export type TutorConversationResponse = Omit<
  RawTutorConversation,
  "messages"
> & {
  messages: TutorMessageResponse[];
};
