import type { paths } from "../../generated/backend-openapi.js";
import type {
  BlogCommentStatus,
  BlogModerationAction,
  BlogPostStatus,
  BlogRecommendationKind,
  BlogReportReason,
  BlogReportStatus,
  BlogTagKind,
  BlogTargetStatus,
  BlogTargetType,
} from "../../generated/graphql.js";

// mirrors the blog module's REST contract exactly as the backend returns it.
//
// Two things Springdoc cannot say, reasserted below with the reason next to each:
//
// 1. Fixed sets arrive as plain `string`. The backend builds these with
//    `enum.name()` (or a computed value, for a target's status), so the
//    generated type loses the set: a post's and a comment's `status`, a tag's
//    `kind`, a report's `reason` and `status`, and a moderation target's
//    `targetType` and `targetStatus`, the actions' `action`. The unions come
//    from the GraphQL schema's enums, which mirror the Java ones.
// 2. `| null` is dropped from a field whose type is another record, even when
//    the Java record marks it @Schema(nullable = true): it can only attach
//    `nullable` to a scalar. Every author, reporter and moderator is null once
//    that account was erased, and a moderation target's `content` is null once
//    its author deleted it. The generated type would let a caller read
//    `.author.displayName` without a check, which is the crash this prevents.

type Json<T> = T extends { content: { "application/json": infer B } }
  ? B
  : never;

/** `author`, `reporter` and `moderator` are all this record, or null for an erased account. */
type RawAuthorResponse =
  paths["/api/blog/posts/{id}"]["get"]["responses"][200]["content"]["application/json"]["author"];
export type BlogAuthorResponse = RawAuthorResponse | null;

type RawTagResponse =
  paths["/api/blog/posts/{id}"]["get"]["responses"][200]["content"]["application/json"]["tags"][number];
export type BlogTagResponse = Omit<RawTagResponse, "kind"> & {
  kind: BlogTagKind;
};

// GET /api/blog/posts/{id}; POST /api/blog/posts and PUT /api/blog/posts/{id} answer with the same body.
type RawPostDetailResponse =
  paths["/api/blog/posts/{id}"]["get"]["responses"][200]["content"]["application/json"];
export type BlogPostDetailResponse = Omit<
  RawPostDetailResponse,
  "author" | "status" | "tags"
> & {
  author: BlogAuthorResponse;
  status: BlogPostStatus;
  tags: BlogTagResponse[];
};

// GET /api/blog/posts
type RawPostPageResponse =
  paths["/api/blog/posts"]["get"]["responses"][200]["content"]["application/json"];
type RawPostSummaryResponse = RawPostPageResponse["items"][number];
export type BlogPostSummaryResponse = Omit<
  RawPostSummaryResponse,
  "author" | "status" | "tags"
> & {
  author: BlogAuthorResponse;
  status: BlogPostStatus;
  tags: BlogTagResponse[];
};
export type BlogPostPageResponse = Omit<RawPostPageResponse, "items"> & {
  items: BlogPostSummaryResponse[];
};
// GET /api/blog/saved-posts answers with the same page of the same summaries.

// GET /api/blog/recommendations: the reason is nested here, the GraphQL type
// reads it flat. `kind` arrives as a plain string like every other fixed set.
type RawRecommendationResponse =
  paths["/api/blog/recommendations"]["get"]["responses"][200]["content"]["application/json"][number];
export type BlogRecommendationResponse = {
  post: BlogPostSummaryResponse;
  reason: Omit<RawRecommendationResponse["reason"], "kind" | "matchedTags"> & {
    kind: BlogRecommendationKind;
    matchedTags: BlogTagResponse[];
  };
};

// GET /api/blog/posts/{id}/comments; POST and PUT answer with one comment.
type RawCommentPageResponse =
  paths["/api/blog/posts/{id}/comments"]["get"]["responses"][200]["content"]["application/json"];
type RawCommentResponse = RawCommentPageResponse["items"][number];
export type BlogCommentResponse = Omit<
  RawCommentResponse,
  "author" | "status"
> & {
  author: BlogAuthorResponse;
  status: BlogCommentStatus;
};
export type BlogCommentPageResponse = Omit<RawCommentPageResponse, "items"> & {
  items: BlogCommentResponse[];
};

// GET /api/blog/tags
export type BlogTagCatalogueResponse =
  paths["/api/blog/tags"]["get"]["responses"][200]["content"]["application/json"];

// PUT and DELETE /api/blog/posts/{id}/like answer with the same body.
export type BlogLikeStateResponse =
  paths["/api/blog/posts/{id}/like"]["put"]["responses"][200]["content"]["application/json"];

// PUT and DELETE /api/blog/posts/{id}/save answer with the same body.
export type BlogSaveStateResponse =
  paths["/api/blog/posts/{id}/save"]["put"]["responses"][200]["content"]["application/json"];

// POST /api/blog/images
export type BlogImageUploadResponse = Json<
  paths["/api/blog/images"]["post"]["responses"][201]
>;
export type StartBlogImageUploadRequest =
  paths["/api/blog/images"]["post"]["requestBody"]["content"]["application/json"];

// POST /api/blog/posts/{id}/reports and /api/blog/comments/{id}/reports answer
// 201 for a new report and 200 for the reporter's own open one: the same body.
type RawReportResponse = Json<
  paths["/api/blog/posts/{id}/reports"]["post"]["responses"][201]
>;
export type BlogReportResponse = Omit<
  RawReportResponse,
  "targetType" | "reason" | "status"
> & {
  targetType: BlogTargetType;
  reason: BlogReportReason;
  status: BlogReportStatus;
};

export type SavePostRequest =
  paths["/api/blog/posts"]["post"]["requestBody"]["content"]["application/json"];
export type UpdatePostRequest =
  paths["/api/blog/posts/{id}"]["put"]["requestBody"]["content"]["application/json"];
export type SaveCommentRequest =
  paths["/api/blog/posts/{id}/comments"]["post"]["requestBody"]["content"]["application/json"];
export type ReportContentRequest =
  paths["/api/blog/posts/{id}/reports"]["post"]["requestBody"]["content"]["application/json"];

// GET /api/admin/blog/queue
type RawQueuePageResponse =
  paths["/api/admin/blog/queue"]["get"]["responses"][200]["content"]["application/json"];
type RawQueueItemResponse = RawQueuePageResponse["items"][number];
export type ModerationQueueItemResponse = Omit<
  RawQueueItemResponse,
  "targetType" | "targetStatus" | "reasons" | "author"
> & {
  targetType: BlogTargetType;
  targetStatus: BlogTargetStatus;
  reasons: BlogReportReason[];
  author: BlogAuthorResponse;
};
export type ModerationQueuePageResponse = Omit<
  RawQueuePageResponse,
  "items"
> & {
  items: ModerationQueueItemResponse[];
};

// GET /api/admin/blog/targets/{type}/{id}; POST .../actions answers with the same body.
type RawTargetResponse =
  paths["/api/admin/blog/targets/{type}/{id}"]["get"]["responses"][200]["content"]["application/json"];
type RawTargetReport = RawTargetResponse["reports"][number];
type RawTargetAction = RawTargetResponse["actions"][number];
export type ModerationTargetResponse = Omit<
  RawTargetResponse,
  "targetType" | "targetStatus" | "content" | "author" | "reports" | "actions"
> & {
  targetType: BlogTargetType;
  targetStatus: BlogTargetStatus;
  content:
    | (Omit<NonNullable<RawTargetResponse["content"]>, "tags"> & {
        tags: BlogTagResponse[];
      })
    | null;
  author: BlogAuthorResponse;
  reports: Array<
    Omit<RawTargetReport, "reporter" | "reason" | "status"> & {
      reporter: BlogAuthorResponse;
      reason: BlogReportReason;
      status: BlogReportStatus;
    }
  >;
  actions: Array<
    Omit<RawTargetAction, "moderator" | "action"> & {
      moderator: BlogAuthorResponse;
      action: BlogModerationAction;
    }
  >;
};
export type ModerationActionRequest =
  paths["/api/admin/blog/targets/{type}/{id}/actions"]["post"]["requestBody"]["content"]["application/json"];

// GET /api/admin/blog/actions
type RawActionPageResponse =
  paths["/api/admin/blog/actions"]["get"]["responses"][200]["content"]["application/json"];
type RawActionResponse = RawActionPageResponse["items"][number];
export type ModerationActionResponse = Omit<
  RawActionResponse,
  "targetType" | "action" | "moderator"
> & {
  targetType: BlogTargetType;
  action: BlogModerationAction;
  moderator: BlogAuthorResponse;
};
export type ModerationActionPageResponse = Omit<
  RawActionPageResponse,
  "items"
> & { items: ModerationActionResponse[] };
