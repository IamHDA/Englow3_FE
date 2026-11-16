import type { paths } from "../../generated/backend-openapi.js";
import type {
  FriendRequestStatus,
  RelationshipStatus,
} from "../../generated/graphql.js";

// mirrors the friendship module's REST contract exactly as the backend returns it.

// Springdoc renders `relationship` and the request `status` as plain `string`:
// the backend builds them with `enum.name()`, so the generated type loses the
// fixed set. They are reasserted below as what they are - RelationshipStatus
// (friendship.entity) and FriendshipStatus (PENDING | ACCEPTED). The unions
// come from the GraphQL schema's enums, which mirror those two Java enums.

// GET /api/friends
export type FriendPageResponse =
  paths["/api/friends"]["get"]["responses"][200]["content"]["application/json"];

// GET /api/friends/search
type RawLearnerSearchPageResponse =
  paths["/api/friends/search"]["get"]["responses"][200]["content"]["application/json"];
export type LearnerSearchResponse = Omit<
  RawLearnerSearchPageResponse["items"][number],
  "relationship"
> & { relationship: RelationshipStatus };
export type LearnerSearchPageResponse = Omit<
  RawLearnerSearchPageResponse,
  "items"
> & { items: LearnerSearchResponse[] };

// GET /api/friends/relationships/{userId} - the field is `relationship`; the
// GraphQL type calls it `status` (see friendship.mapper.ts).
type RawRelationshipResponse =
  paths["/api/friends/relationships/{userId}"]["get"]["responses"][200]["content"]["application/json"];
export type RelationshipResponse = Omit<
  RawRelationshipResponse,
  "relationship"
> & { relationship: RelationshipStatus };

// GET /api/friends/users/{userId}/count and GET /api/friends/requests/incoming/count
export type FriendCountResponse =
  paths["/api/friends/users/{userId}/count"]["get"]["responses"][200]["content"]["application/json"];
export type IncomingRequestCountResponse =
  paths["/api/friends/requests/incoming/count"]["get"]["responses"][200]["content"]["application/json"];

// GET /api/friends/requests/incoming and /outgoing answer with the same shape
export type FriendRequestPageResponse =
  paths["/api/friends/requests/incoming"]["get"]["responses"][200]["content"]["application/json"];

// GET /api/friends/blocks
export type BlockedUserPageResponse =
  paths["/api/friends/blocks"]["get"]["responses"][200]["content"]["application/json"];

// POST /api/friends/requests answers 201 (new) or 200 (already there, or the
// other learner's request answered); POST .../{requestId}/accept answers 200.
// All three carry the same body.
export type SendFriendRequestRequest =
  paths["/api/friends/requests"]["post"]["requestBody"]["content"]["application/json"];
type RawFriendRequestOutcomeResponse =
  paths["/api/friends/requests"]["post"]["responses"][201]["content"]["application/json"];
export type FriendRequestOutcomeResponse = Omit<
  RawFriendRequestOutcomeResponse,
  "status"
> & { status: FriendRequestStatus };
