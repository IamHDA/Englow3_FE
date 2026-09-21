import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  FlashcardResponse,
  FlashcardReviewResponse,
  FlashcardSetDetailResponse,
  FlashcardSetPageResponse,
  RateFlashcardRequest,
  SearchFlashcardSetsParams,
} from "./learning.types.js";

const FLASHCARD_BASE_PATH = "/api/flashcards";

export class LearningApi {
  constructor(private readonly client: BackendClient) {}

  searchFlashcardSets(
    params: SearchFlashcardSetsParams,
  ): Promise<FlashcardSetPageResponse> {
    const query = new URLSearchParams();
    if (params.topic) query.set("topic", params.topic);
    if (params.title) query.set("title", params.title);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    return this.client.get(`${FLASHCARD_BASE_PATH}/sets?${query.toString()}`);
  }

  getFlashcardSet(id: string): Promise<FlashcardSetDetailResponse> {
    return this.client.get(
      `${FLASHCARD_BASE_PATH}/sets/${encodeURIComponent(id)}`,
    );
  }

  /** Due cards first, then unseen ones - the ordering is the backend's call, not ours. */
  getStudyQueue(id: string, limit: number): Promise<FlashcardResponse[]> {
    return this.client.get(
      `${FLASHCARD_BASE_PATH}/sets/${encodeURIComponent(id)}/study-queue?limit=${limit}`,
    );
  }

  rateFlashcard(
    id: string,
    body: RateFlashcardRequest,
  ): Promise<FlashcardReviewResponse> {
    return this.client.post(
      `${FLASHCARD_BASE_PATH}/${encodeURIComponent(id)}/reviews`,
      body,
    );
  }
}
