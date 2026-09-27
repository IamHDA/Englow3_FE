import type { LearnerAttemptStatus } from "../../generated/graphql.js";
import type { paths } from "../../generated/backend-openapi.js";

// mirrors GET /api/admin/exams/{id}/... etc. Admin-side exam list/detail.
export type ExamPageResponse =
  paths["/api/admin/exams"]["get"]["responses"][200]["content"]["application/json"];
export type ExamListItemResponse = ExamPageResponse["items"][number];

// mirrors ExamResponse (POST create/publish/archive, PUT update) exactly as the backend returns it
export type ExamResponse =
  paths["/api/admin/exams"]["post"]["responses"][201]["content"]["application/json"];

// mirrors GET /api/exams (learner search) - returns published exams
type RawLearnerExamPageResponse =
  paths["/api/exams"]["get"]["responses"][200]["content"]["application/json"];
type RawLearnerExamItemResponse = RawLearnerExamPageResponse["items"][number];

/**
 * `attemptStatus` is computed as a plain `String` on the backend (see
 * LearnerExamListItemResult.java: `hasLiveAttempt ? IN_PROGRESS : ...`), not
 * the Java enum, so OpenAPI can only say `string`. Reasserted here as the
 * fixed set of values that expression actually produces.
 */
export type LearnerExamItemResponse = Omit<
  RawLearnerExamItemResponse,
  "attemptStatus"
> & {
  attemptStatus: LearnerAttemptStatus;
};
// mirrors LearnerExamCardResponse from GET /api/exams
export type LearnerExamPageResponse = Omit<
  RawLearnerExamPageResponse,
  "items"
> & {
  items: LearnerExamItemResponse[];
};

// The paper the learner sits, from GET /api/exam-attempts/{attemptId}/paper.
// It deliberately carries no `correct` flag and no explanation: the backend
// strips both so the answer key never reaches the browser mid-attempt. They
// come back afterwards on the attempt result instead.
export type ExamPaperResponse =
  paths["/api/exam-attempts/{id}/paper"]["get"]["responses"][200]["content"]["application/json"];
export type ExamSectionDto = ExamPaperResponse["sections"][number];
export type SectionPartDto = ExamSectionDto["parts"][number];
// The backend resolves object keys into pre-signed URLs before answering, so
// what arrives here is already fetchable and expires on its own.
export type QuestionSetDto = SectionPartDto["questionSets"][number];
export type QuestionDto = QuestionSetDto["questions"][number];
export type QuestionOptionDto = QuestionDto["options"][number];

// mirrors ExamAttemptResponse - the shape POST /api/exams/{id}/attempts,
// POST /api/exam-attempts/{id}/submit and GET /api/exam-attempts/{id}/result
// all answer with. The scoring fields stay null while the attempt is
// IN_PROGRESS, and `questions` is empty until it is scored. The backend
// answers 200 (resumed) or 201 (new attempt) on start - same shape either way.
type StartExamAttemptOp = paths["/api/exams/{id}/attempts"]["post"];
export type ExamAttemptResponse =
  | StartExamAttemptOp["responses"][200]["content"]["application/json"]
  | StartExamAttemptOp["responses"][201]["content"]["application/json"];
export type AttemptQuestionReviewDto = ExamAttemptResponse["questions"][number];
export type AttemptOptionReviewDto =
  AttemptQuestionReviewDto["options"][number];

// GET /api/exam-attempts - the learner's own sittings, newest first
export type ExamAttemptPageResponse =
  paths["/api/exam-attempts"]["get"]["responses"][200]["content"]["application/json"];

// mirrors POST /api/exam-attempts/{id}/submit request body
export type SubmitExamAttemptRequest =
  paths["/api/exam-attempts/{id}/submit"]["post"]["requestBody"]["content"]["application/json"];
export type SubmittedAnswer = SubmitExamAttemptRequest["answers"][number];
