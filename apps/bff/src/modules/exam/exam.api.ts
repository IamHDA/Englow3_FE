import type {
  QueryAdminExamsArgs,
  QueryExamsArgs,
} from "../../generated/graphql.js";
import type { BackendClient } from "../../shared/http/backendClient.js";
import { toQueryString } from "../../shared/http/queryParams.js";
import type {
  ExamAttemptPageResponse,
  ExamAttemptResponse,
  ExamOutlineResponse,
  ExamPageResponse,
  ExamPaperResponse,
  ExamResponse,
  LearnerExamItemResponse,
  LearnerExamPageResponse,
  StartExamAttemptRequest,
  SubmittedAnswer,
} from "./exam.types.js";

const ADMIN_EXAM_BASE_PATH = "/api/admin/exams";
const EXAM_BASE_PATH = "/api/exams";
const ATTEMPT_BASE_PATH = "/api/exam-attempts";

export class ExamApi {
  constructor(private readonly client: BackendClient) {}

  draft(
    attemptId: string,
  ): Promise<import("../../generated/graphql.js").ExamDraft> {
    return this.client.get(
      `${ATTEMPT_BASE_PATH}/${encodeURIComponent(attemptId)}/draft`,
    );
  }
  saveDraft(
    attemptId: string,
    version: number,
    answers: SubmittedAnswer[],
  ): Promise<import("../../generated/graphql.js").ExamDraft> {
    return this.client.put(
      `${ATTEMPT_BASE_PATH}/${encodeURIComponent(attemptId)}/draft`,
      { version, answers },
    );
  }

  /** Learner search on the backend (/api/exams) - returns published exams. */
  searchAsLearner(params: QueryExamsArgs): Promise<LearnerExamPageResponse> {
    const query = toQueryString({
      examType: params.examType,
      certificateType: params.certificateType,
      certificateVariant: params.certificateVariant,
      targetLevel: params.targetLevel,
      title: params.title,
      sortBy: params.sortBy,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return this.client.get(`${EXAM_BASE_PATH}?${query}`);
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
  startAttempt(
    examId: string,
    request?: StartExamAttemptRequest,
  ): Promise<ExamAttemptResponse> {
    return this.client.post(
      `${EXAM_BASE_PATH}/${encodeURIComponent(examId)}/attempts`,
      request,
    );
  }

  /** Skills and parts with question counts - what a practice is picked from. */
  getOutline(examId: string): Promise<ExamOutlineResponse> {
    return this.client.get(
      `${EXAM_BASE_PATH}/${encodeURIComponent(examId)}/outline`,
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
  searchAsAdmin(params: QueryAdminExamsArgs): Promise<ExamPageResponse> {
    const query = toQueryString({
      status: params.status,
      examType: params.examType,
      title: params.title,
      page: params.page ?? 0,
      size: params.size ?? 20,
    });

    return this.client.get(`${ADMIN_EXAM_BASE_PATH}?${query}`);
  }

  /** Admin-only on the backend. Refuses a non-draft or an incomplete paper - see Exam.publish(). */
  publishAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/publish`,
    );
  }

  /** Staff or admin on the backend. Refuses a paper that is not a draft or rejected. */
  submitForReviewAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/submit-for-review`,
    );
  }

  /** Admin-only on the backend. Publishes in the same step as approving. */
  approveAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/approve`,
    );
  }

  /** Admin-only on the backend. The note is required - a blank one is refused there too. */
  rejectAsAdmin(id: string, note: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/reject`,
      { note },
    );
  }

  /** Admin-only on the backend. Back to PUBLISHED if it had been, DRAFT otherwise. */
  restoreAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/restore`,
    );
  }

  /** Admin-only on the backend. Refuses a paper that is already archived. */
  archiveAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/archive`,
    );
  }
}
