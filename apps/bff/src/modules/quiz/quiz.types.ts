import type { paths } from "../../generated/backend-openapi.js";

// mirrors the quiz module's REST contract exactly as the backend returns it.

// GET /api/quizzes
export type QuizPageResponse =
  paths["/api/quizzes"]["get"]["responses"][200]["content"]["application/json"];
export type QuizSummaryResponse = QuizPageResponse["items"][number];

// GET /api/quiz-attempts/{id}/paper
export type QuizPaperResponse =
  paths["/api/quiz-attempts/{id}/paper"]["get"]["responses"][200]["content"]["application/json"];
// An option as the learner sees it while sitting - there is no `correct` field
// on this shape at all, which is why the answer key cannot leak from it.
export type QuizPaperQuestionResponse = QuizPaperResponse["questions"][number];
export type QuizOptionResponse = QuizPaperQuestionResponse["options"][number];

// POST /api/quizzes/{id}/attempts, POST /api/quiz-attempts/{id}/submit, GET .../result -
// the backend answers 200 or 201 depending on whether the attempt already
// existed, both with the same shape.
type StartQuizAttemptOp = paths["/api/quizzes/{id}/attempts"]["post"];
export type QuizAttemptResponse =
  | StartQuizAttemptOp["responses"][200]["content"]["application/json"]
  | StartQuizAttemptOp["responses"][201]["content"]["application/json"];
/** Empty while the attempt is IN_PROGRESS - it carries the answer key. */
export type QuizQuestionReviewResponse = QuizAttemptResponse["reviews"][number];

export type SubmitQuizAttemptRequest =
  paths["/api/quiz-attempts/{id}/submit"]["post"]["requestBody"]["content"]["application/json"];
