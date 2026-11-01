import type {
  QueryTranslationAttemptsArgs,
  QueryTranslationSetsArgs,
} from "../../generated/graphql.js";
import type { BackendClient } from "../../shared/http/backendClient.js";
import { toQueryString } from "../../shared/http/queryParams.js";
import type {
  TranslationAttemptPageResponse,
  TranslationAttemptResponse,
  TranslationSetDetailResponse,
  TranslationSetPageResponse,
} from "./translation.types.js";

const TRANSLATION_BASE_PATH = "/api/translation";

export class TranslationApi {
  constructor(private readonly client: BackendClient) {}

  searchSets(
    params: QueryTranslationSetsArgs,
  ): Promise<TranslationSetPageResponse> {
    const query = toQueryString({
      topic: params.topic,
      title: params.title,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });
    return this.client.get(`${TRANSLATION_BASE_PATH}/sets?${query}`);
  }

  getSet(id: string): Promise<TranslationSetDetailResponse> {
    return this.client.get(
      `${TRANSLATION_BASE_PATH}/sets/${encodeURIComponent(id)}`,
    );
  }

  /** Records the translation and queues its grading; poll the attempt for the grade. */
  submit(
    itemId: string,
    response: string,
  ): Promise<TranslationAttemptResponse> {
    return this.client.post(
      `${TRANSLATION_BASE_PATH}/items/${encodeURIComponent(itemId)}/attempts`,
      { response },
    );
  }

  getAttempt(id: string): Promise<TranslationAttemptResponse> {
    return this.client.get(
      `${TRANSLATION_BASE_PATH}/attempts/${encodeURIComponent(id)}`,
    );
  }

  getAttempts(
    params: QueryTranslationAttemptsArgs,
  ): Promise<TranslationAttemptPageResponse> {
    const query = toQueryString({
      page: params.page ?? 0,
      size: params.size ?? 20,
    });
    return this.client.get(`${TRANSLATION_BASE_PATH}/attempts?${query}`);
  }
}
