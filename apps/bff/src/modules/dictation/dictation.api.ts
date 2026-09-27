import type { QueryDictationLessonsArgs } from "../../generated/graphql.js";
import type { BackendClient } from "../../shared/http/backendClient.js";
import { toQueryString } from "../../shared/http/queryParams.js";
import type {
  DictationLessonDetailResponse,
  DictationLessonPageResponse,
  DictationStatsResponse,
  DictationSubmissionResponse,
  MistakeSentenceResponse,
} from "./dictation.types.js";

const DICTATION_BASE_PATH = "/api/dictation";

export class DictationApi {
  constructor(private readonly client: BackendClient) {}

  searchDictationLessons(
    params: QueryDictationLessonsArgs,
  ): Promise<DictationLessonPageResponse> {
    const query = toQueryString({
      topic: params.topic,
      title: params.title,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return this.client.get(`${DICTATION_BASE_PATH}/lessons?${query}`);
  }

  getDictationLesson(id: string): Promise<DictationLessonDetailResponse> {
    return this.client.get(
      `${DICTATION_BASE_PATH}/lessons/${encodeURIComponent(id)}`,
    );
  }

  /** The only call that returns a transcript, and only in exchange for an answer. */
  submitDictation(
    sentenceId: string,
    response: string,
  ): Promise<DictationSubmissionResponse> {
    return this.client.post(
      `${DICTATION_BASE_PATH}/sentences/${encodeURIComponent(sentenceId)}/attempts`,
      { response },
    );
  }

  getDictationStats(periodDays: number): Promise<DictationStatsResponse> {
    return this.client.get(
      `${DICTATION_BASE_PATH}/stats?periodDays=${periodDays}`,
    );
  }

  /** Lines this learner keeps getting wrong, across every lesson. */
  getDictationMistakes(): Promise<MistakeSentenceResponse[]> {
    return this.client.get(`${DICTATION_BASE_PATH}/mistakes`);
  }
}
