import type { QueryFlashcardSetsArgs } from "../../generated/graphql.js";
import type { BackendClient } from "../../shared/http/backendClient.js";
import { toQueryString } from "../../shared/http/queryParams.js";
import type {
  FlashcardResponse,
  FlashcardReviewResponse,
  FlashcardSetDetailResponse,
  FlashcardSetPageResponse,
  FlashcardStatsResponse,
  RateFlashcardRequest,
} from "./flashcard.types.js";

const FLASHCARD_BASE_PATH = "/api/flashcards";

export class FlashcardApi {
  constructor(private readonly client: BackendClient) {}

  searchFlashcardSets(
    params: QueryFlashcardSetsArgs,
  ): Promise<FlashcardSetPageResponse> {
    const query = toQueryString({
      topic: params.topic,
      title: params.title,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return this.client.get(`${FLASHCARD_BASE_PATH}/sets?${query}`);
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

  getFlashcardStats(periodDays: number): Promise<FlashcardStatsResponse> {
    return this.client.get(
      `${FLASHCARD_BASE_PATH}/stats?periodDays=${periodDays}`,
    );
  }
}
