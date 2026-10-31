import { isWellFormedId } from "@/shared/network/loadError";

export type TutorStudyContext = {
  quizAttemptId?: string;
  quizQuestionId?: string;
  assessmentAttemptId?: string;
  examAttemptId?: string;
  examQuestionId?: string;
};
export const tutorContextParams = [
  "quizAttempt",
  "quizQuestion",
  "assessmentAttempt",
  "examAttempt",
  "examQuestion",
];

export function parseTutorStudyContext(params: URLSearchParams): {
  context?: TutorStudyContext;
  invalid: boolean;
} {
  const values = tutorContextParams.map((key) => params.get(key));
  if (values.every((value) => value == null)) return { invalid: false };
  if (
    values.some(
      (value, index) =>
        value != null &&
        (!isWellFormedId(value) ||
          params.getAll(tutorContextParams[index]).length !== 1),
    )
  )
    return { invalid: true };
  const [
    quizAttemptId,
    quizQuestionId,
    assessmentAttemptId,
    examAttemptId,
    examQuestionId,
  ] = values;
  if (
    Boolean(quizAttemptId) !== Boolean(quizQuestionId) ||
    Boolean(examAttemptId) !== Boolean(examQuestionId)
  )
    return { invalid: true };
  if (
    [quizAttemptId, assessmentAttemptId, examAttemptId].filter(Boolean)
      .length !== 1
  )
    return { invalid: true };
  return {
    invalid: false,
    context: {
      ...(quizAttemptId && quizQuestionId
        ? { quizAttemptId, quizQuestionId }
        : {}),
      ...(assessmentAttemptId ? { assessmentAttemptId } : {}),
      ...(examAttemptId && examQuestionId
        ? { examAttemptId, examQuestionId }
        : {}),
    },
  };
}
