import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  AdminOverviewResponse,
  ContentKind,
  ContentReviewPageResponse,
  ContentReviewResponse,
  SearchContentParams,
  SpeakingPromptReviewPageResponse,
  SpeakingPromptReviewResponse,
} from "./contentManagement.types.js";

/**
 * Where each content kind lives on the backend. One map rather than a switch in
 * five methods: adding a fourth kind then means one line here, and the five
 * review actions pick it up for free.
 */
const ADMIN_CONTENT_PATHS: Record<ContentKind, string> = {
  FLASHCARD_SET: "/api/admin/flashcards/sets",
  QUIZ: "/api/admin/quizzes",
  DICTATION_LESSON: "/api/admin/dictation/lessons",
  SPEAKING_PROMPT: "/api/admin/speaking/prompts",
};

/**
 * Speaking prompts answer with the speaking module's own shape: the same
 * lifecycle fields plus a reference sentence, minus an item count. Everything
 * the review screen reads is there, so the difference is reconciled here rather
 * than by bending one backend module's record to match another's.
 */
function toContentReview(
  prompt: SpeakingPromptReviewResponse,
): ContentReviewResponse {
  return {
    id: prompt.id,
    slug: prompt.slug,
    title: prompt.title,
    status: prompt.status,
    // A prompt is one sentence, not a collection of things. Null rather than 1,
    // which would be true and tell a reviewer nothing.
    itemCount: null,
    createdAt: prompt.createdAt,
    publishedAt: prompt.publishedAt,
    submittedForReviewAt: prompt.submittedForReviewAt,
    reviewedByUserId: prompt.reviewedByUserId,
    reviewedAt: prompt.reviewedAt,
    reviewNote: prompt.reviewNote,
  };
}

export class ContentManagementApi {
  constructor(private readonly client: BackendClient) {}

  getAdminOverview(): Promise<AdminOverviewResponse> {
    return this.client.get("/api/admin/overview");
  }

  /** The authoring list, at every status. Omitting status asks for all of them. */
  searchContentForAuthoring(
    params: SearchContentParams,
  ): Promise<ContentReviewPageResponse> {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.title) query.set("title", params.title);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    const path = `${ADMIN_CONTENT_PATHS[params.kind]}?${query.toString()}`;
    if (params.kind !== "SPEAKING_PROMPT") {
      return this.client.get(path);
    }

    return this.client
      .get<SpeakingPromptReviewPageResponse>(path)
      .then((page) => ({ ...page, items: page.items.map(toContentReview) }));
  }

  /** One helper behind all five review actions, so the mapping lives in one place. */
  private contentAction(
    kind: ContentKind,
    id: string,
    action: string,
    body?: unknown,
  ): Promise<ContentReviewResponse> {
    const path = `${ADMIN_CONTENT_PATHS[kind]}/${encodeURIComponent(id)}/${action}`;
    if (kind !== "SPEAKING_PROMPT") {
      return this.client.post(path, body);
    }

    return this.client
      .post<SpeakingPromptReviewResponse>(path, body)
      .then(toContentReview);
  }

  submitContentForReview(
    kind: ContentKind,
    id: string,
  ): Promise<ContentReviewResponse> {
    return this.contentAction(kind, id, "submit-for-review");
  }

  approveContent(
    kind: ContentKind,
    id: string,
  ): Promise<ContentReviewResponse> {
    return this.contentAction(kind, id, "approve");
  }

  /** The note travels as given - the rule that it must say something is the backend entity. */
  rejectContent(
    kind: ContentKind,
    id: string,
    note: string,
  ): Promise<ContentReviewResponse> {
    return this.contentAction(kind, id, "reject", { note });
  }

  publishContent(
    kind: ContentKind,
    id: string,
  ): Promise<ContentReviewResponse> {
    return this.contentAction(kind, id, "publish");
  }

  archiveContent(
    kind: ContentKind,
    id: string,
  ): Promise<ContentReviewResponse> {
    return this.contentAction(kind, id, "archive");
  }
}
