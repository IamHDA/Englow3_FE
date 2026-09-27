import type { QueryQuizzesArgs } from "../../generated/graphql.js";
import type { BackendClient } from "../../shared/http/backendClient.js";
import { toQueryString } from "../../shared/http/queryParams.js";
import type {
  QuizAttemptResponse,
  QuizPageResponse,
  QuizPaperResponse,
  SubmitQuizAttemptRequest,
} from "./quiz.types.js";

const QUIZ_BASE_PATH = "/api/quizzes";
const QUIZ_ATTEMPT_BASE_PATH = "/api/quiz-attempts";

export class QuizApi {
  constructor(private readonly client: BackendClient) {}

  searchQuizzes(params: QueryQuizzesArgs): Promise<QuizPageResponse> {
    const query = toQueryString({
      category: params.category,
      title: params.title,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return this.client.get(`${QUIZ_BASE_PATH}?${query}`);
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
}
