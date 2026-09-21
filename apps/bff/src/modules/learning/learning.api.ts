import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  DictationLessonDetailResponse,
  DictationLessonPageResponse,
  DictationSubmissionResponse,
  FlashcardResponse,
  SearchDictationLessonsParams,
  QuizAttemptResponse,
  QuizPageResponse,
  QuizPaperResponse,
  SearchQuizzesParams,
  SubmitQuizAttemptRequest,
  FlashcardReviewResponse,
  FlashcardSetDetailResponse,
  FlashcardSetPageResponse,
  RateFlashcardRequest,
  SearchFlashcardSetsParams,
} from "./learning.types.js";

const FLASHCARD_BASE_PATH = "/api/flashcards";
const QUIZ_BASE_PATH = "/api/quizzes";
const QUIZ_ATTEMPT_BASE_PATH = "/api/quiz-attempts";
const DICTATION_BASE_PATH = "/api/dictation";

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

  searchQuizzes(params: SearchQuizzesParams): Promise<QuizPageResponse> {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.title) query.set("title", params.title);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    return this.client.get(`${QUIZ_BASE_PATH}?${query.toString()}`);
  }

  /** Opens an attempt, or returns the one already open with resumed: true. */
  startQuizAttempt(quizId: string): Promise<QuizAttemptResponse> {
    return this.client.post(
      `${QUIZ_BASE_PATH}/${encodeURIComponent(quizId)}/attempts`,
    );
  }

  /** The paper is reachable only through an attempt - never by quiz id. */
  getQuizPaper(attemptId: string): Promise<QuizPaperResponse> {
    return this.client.get(
      `${QUIZ_ATTEMPT_BASE_PATH}/${encodeURIComponent(attemptId)}/paper`,
    );
  }

  submitQuizAttempt(
    attemptId: string,
    body: SubmitQuizAttemptRequest,
  ): Promise<QuizAttemptResponse> {
    return this.client.post(
      `${QUIZ_ATTEMPT_BASE_PATH}/${encodeURIComponent(attemptId)}/submit`,
      body,
    );
  }

  getQuizAttemptResult(attemptId: string): Promise<QuizAttemptResponse> {
    return this.client.get(
      `${QUIZ_ATTEMPT_BASE_PATH}/${encodeURIComponent(attemptId)}/result`,
    );
  }

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
}
