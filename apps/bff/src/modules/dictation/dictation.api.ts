import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  DictationLessonDetailResponse,
  DictationLessonPageResponse,
  DictationStatsResponse,
  DictationSubmissionResponse,
  MistakeSentenceResponse,
  SearchDictationLessonsParams,
} from "./dictation.types.js";

const DICTATION_BASE_PATH = "/api/dictation";

export class DictationApi {
  constructor(private readonly client: BackendClient) {}

  searchDictationLessons(
    params: SearchDictationLessonsParams,
  ): Promise<DictationLessonPageResponse> {
    const query = new URLSearchParams();
    if (params.topic) query.set("topic", params.topic);
    if (params.title) query.set("title", params.title);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    return this.client.get(
      `${DICTATION_BASE_PATH}/lessons?${query.toString()}`,
    );
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
