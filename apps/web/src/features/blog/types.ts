import type {
  AdminBlogActionsQuery,
  AdminBlogQueueQuery,
  BlogAuthorFieldsFragment,
  BlogCommentFieldsFragment,
  BlogModerationTargetFieldsFragment,
  BlogPostFieldsFragment,
  BlogPostPageFieldsFragment,
  BlogPostSummaryFieldsFragment,
  BlogTagCatalogueQuery,
  BlogTagFieldsFragment,
} from "@/lib/graphql/generated";

/** The person behind a post or a comment. Null wherever one appears: the account was erased. */
export type BlogAuthorData = BlogAuthorFieldsFragment;

export type BlogTagData = BlogTagFieldsFragment;

/** A post as a card shows it, in a list or on a wall. */
export type BlogPostSummaryData = BlogPostSummaryFieldsFragment;

export type BlogPostPageData = BlogPostPageFieldsFragment;

/** A post in full: to read, and to edit. */
export type BlogPostData = BlogPostFieldsFragment;

export type BlogImageData = BlogPostData["images"][number];

export type BlogCommentData = BlogCommentFieldsFragment;

export type BlogTagCatalogueData = BlogTagCatalogueQuery["blogTagCatalogue"];

export type ModerationQueueItemData =
  AdminBlogQueueQuery["adminBlogQueue"]["items"][number];

export type ModerationTargetData = BlogModerationTargetFieldsFragment;

export type ModerationActionRecordData =
  AdminBlogActionsQuery["adminBlogActions"]["items"][number];
