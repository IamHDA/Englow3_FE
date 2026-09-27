import type {
  ContentStatus,
  OverviewContentKind,
} from "../../generated/graphql.js";

// mirrors the admin content review and overview contracts exactly as the backend returns them.

// mirrors AdminOverviewResponse from GET /api/admin/overview
export type AdminOverviewResponse = {
  content: {
    kind: OverviewContentKind;
    drafts: number;
    pendingReview: number;
    published: number;
  }[];
  pendingReviewTotal: number;
  learners: number;
  newLearners: number;
  activeLearners: number;
  cardReviews: number;
  dictationSentences: number;
  quizzesSubmitted: number;
  examsSubmitted: number;
  periodDays: number;
};

// mirrors ContentReviewResponse exactly as the backend returns it
export type ContentReviewResponse = {
  id: string;
  slug: string;
  title: string;
  /**
   * Sent as a string because the backend's three status enums are separate
   * types with identical values. The GraphQL enum above is what validates it.
   */
  status: ContentStatus;
  /**
   * Cards, questions or sentences - whatever this kind is made of. Null for a
   * speaking prompt, which is one sentence rather than a collection of things:
   * "1 item" would be true and tell a reviewer nothing.
   */
  itemCount: number | null;
  createdAt: string;
  publishedAt: string | null;
  submittedForReviewAt: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};

export type ContentReviewPageResponse = {
  items: ContentReviewResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

/**
 * The speaking module's own review shape. It is not ContentReviewResponse and
 * cannot be: that record lives in the backend's learning module, and a
 * persistence-adjacent type does not cross a module boundary there.
 *
 * Reconciling the two is a per-client concern, so it happens here.
 */
export type SpeakingPromptReviewResponse = {
  id: string;
  slug: string;
  title: string;
  category: string;
  targetLevel: string | null;
  referenceText: string;
  status: ContentStatus;
  createdAt: string;
  publishedAt: string | null;
  submittedForReviewAt: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};

export type SpeakingPromptReviewPageResponse = {
  items: SpeakingPromptReviewResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};
