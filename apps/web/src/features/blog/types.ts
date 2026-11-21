import type {
  AdminBlogActionsQuery,
  AdminBlogQueueQuery,
  BlogAuthorFieldsFragment,
  BlogCommentFieldsFragment,
  BlogModerationTargetFieldsFragment,
  BlogPostFieldsFragment,
  BlogPostPageFieldsFragment,
  BlogPostSummaryFieldsFragment,
  BlogRecommendationsQuery,
  BlogSearchSuggestQuery,
  BlogTagCatalogueQuery,
  BlogTagFieldsFragment,
  SearchLearnersQuery,
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

/** A post with the reason it is recommended. */
export type BlogRecommendationData =
  BlogRecommendationsQuery["blogRecommendations"][number];

/** A post in the search box's dropdown: its title, tags and date. */
export type PostSuggestionData =
  BlogSearchSuggestQuery["blogPosts"]["items"][number];

/** A person in the search box's dropdown, as the friends search finds them. */
export type PersonSuggestionData =
  SearchLearnersQuery["searchLearners"]["items"][number];

/** One group of the dropdown: still loading, failed, or the first few and how many there are in all. */
export type SuggestionGroup<Item> =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; items: Item[]; total: number };
