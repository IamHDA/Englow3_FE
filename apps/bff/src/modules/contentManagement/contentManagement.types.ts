import type {
  ContentStatus,
  OverviewContentKind,
} from "../../generated/graphql.js";
import type { paths } from "../../generated/backend-openapi.js";

// mirrors the admin content review and overview contracts exactly as the backend returns them.

type RawAdminOverviewResponse =
  paths["/api/admin/overview"]["get"]["responses"][200]["content"]["application/json"];

// mirrors AdminOverviewResponse from GET /api/admin/overview. `content[].kind`
// is a plain `String` on the backend (see AdminOverviewResponse.java) - one
// counts row per content kind, keyed by a string rather than its own enum.
export type AdminOverviewResponse = Omit<
  RawAdminOverviewResponse,
  "content"
> & {
  content: (Omit<RawAdminOverviewResponse["content"][number], "kind"> & {
    kind: OverviewContentKind;
  })[];
};

// mirrors ContentReviewResponse exactly as the backend returns it. Quiz,
// flashcard and dictation each declare their own identical record (a
// persistence-adjacent type does not cross a module boundary on the backend);
// quiz's stands in for all three here.
type RawContentReviewPageResponse =
  paths["/api/admin/quizzes"]["get"]["responses"][200]["content"]["application/json"];
type RawContentReviewResponse = RawContentReviewPageResponse["items"][number];

/**
 * `status` is a plain `String` on all three backend records (see e.g.
 * quiz/dto/response/ContentReviewResponse.java) - the three status enums are
 * separate Java types with identical values, so springdoc can't narrow it.
 * The GraphQL enum above is what actually validates it.
 */
export type ContentReviewResponse = Omit<
  RawContentReviewResponse,
  "status" | "itemCount"
> & {
  status: ContentStatus;
  /**
   * Cards, questions or sentences - whatever this kind is made of. Null for a
   * speaking prompt, which is one sentence rather than a collection of things:
   * "1 item" would be true and tell a reviewer nothing. (Real on quiz/flashcard/
   * dictation; forced to null when a SpeakingPromptReviewResponse is
   * reconciled into this shape - see contentManagement.api.ts.)
   */
  itemCount: number | null;
};

export type ContentReviewPageResponse = Omit<
  RawContentReviewPageResponse,
  "items"
> & {
  items: ContentReviewResponse[];
};

/**
 * The speaking module's own review shape. It is not ContentReviewResponse and
 * cannot be: that record lives in the backend's learning module, and a
 * persistence-adjacent type does not cross a module boundary there.
 *
 * Reconciling the two is a per-client concern, so it happens here.
 */
export type SpeakingPromptReviewPageResponse =
  paths["/api/admin/speaking/prompts"]["get"]["responses"][200]["content"]["application/json"];
export type SpeakingPromptReviewResponse =
  SpeakingPromptReviewPageResponse["items"][number];
