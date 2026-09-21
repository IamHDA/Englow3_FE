import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  ExamAttemptPageResponse,
  ExamAttemptResponse,
  ExamPageResponse,
  ExamPaperResponse,
  ExamResponse,
  LearnerExamItemResponse,
  LearnerExamPageResponse,
  SearchExamsParams,
  SearchLearnerExamsParams,
  SubmittedAnswer,
} from "./exam.types.js";

const ADMIN_EXAM_BASE_PATH = "/api/admin/exams";
const EXAM_BASE_PATH = "/api/exams";
const ATTEMPT_BASE_PATH = "/api/exam-attempts";

export class ExamApi {
  constructor(private readonly client: BackendClient) {}

  /** Learner search on the backend (/api/exams) - returns published exams. */
  searchAsLearner(
    params: SearchLearnerExamsParams,
  ): Promise<LearnerExamPageResponse> {
    const query = new URLSearchParams();
    if (params.examType) query.set("examType", params.examType);
    if (params.certificateType)
      query.set("certificateType", params.certificateType);
    if (params.certificateVariant)
      query.set("certificateVariant", params.certificateVariant);
    if (params.targetLevel) query.set("targetLevel", params.targetLevel);
    if (params.title) query.set("title", params.title);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    return this.client.get(`${EXAM_BASE_PATH}?${query.toString()}`);
  }

  /** The placement paper to sit. 404 when the deployment has none published. */
  getPlacementExam(): Promise<LearnerExamItemResponse> {
    return this.client.get(`${EXAM_BASE_PATH}/placement`);
  }

  getByIdAsLearner(id: string): Promise<LearnerExamItemResponse> {
    return this.client.get(`${EXAM_BASE_PATH}/${encodeURIComponent(id)}`);
  }

  /**
   * Opens an attempt, or hands back the one already open - the backend answers
   * 201 for a new attempt and 200 with `resumed: true` for an existing one, and
   * a unique index stops a learner holding two at once.
   */
  startAttempt(examId: string): Promise<ExamAttemptResponse> {
    return this.client.post(
      `${EXAM_BASE_PATH}/${encodeURIComponent(examId)}/attempts`,
    );
  }

  /** The paper is reachable only through an attempt, never by exam id. */
  getAttemptPaper(attemptId: string): Promise<ExamPaperResponse> {
    return this.client.get(
      `${ATTEMPT_BASE_PATH}/${encodeURIComponent(attemptId)}/paper`,
    );
  }

  submitAttempt(
    attemptId: string,
    answers: SubmittedAnswer[],
  ): Promise<ExamAttemptResponse> {
    return this.client.post(
      `${ATTEMPT_BASE_PATH}/${encodeURIComponent(attemptId)}/submit`,
      { answers },
    );
  }

  /** The learner's own sittings, newest first. No review data on these rows. */
  listAttempts(page: number, size: number): Promise<ExamAttemptPageResponse> {
    return this.client.get(`${ATTEMPT_BASE_PATH}?page=${page}&size=${size}`);
  }

  getAttemptResult(attemptId: string): Promise<ExamAttemptResponse> {
    return this.client.get(
      `${ATTEMPT_BASE_PATH}/${encodeURIComponent(attemptId)}/result`,
    );
  }

  /** Admin-only on the backend (@PreAuthorize hasRole ADMIN) - it answers 403 for anyone else. */
  searchAsAdmin(params: SearchExamsParams): Promise<ExamPageResponse> {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.examType) query.set("examType", params.examType);
    if (params.title) query.set("title", params.title);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    return this.client.get(`${ADMIN_EXAM_BASE_PATH}?${query.toString()}`);
  }

  /** Admin-only on the backend. Refuses a non-draft or an incomplete paper - see Exam.publish(). */
  publishAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/publish`,
    );
  }

  /** Admin-only on the backend. Refuses a paper that is already archived. */
  archiveAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/archive`,
    );
  }
}
