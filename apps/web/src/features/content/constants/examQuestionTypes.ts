/**
 * How an exam question is answered, as the backend's QuestionType names it. The
 * authoring document travels as plain JSON through the REST proxy, so these are
 * not generated - keep them in step with `com.englow3.exam.entity.QuestionType`.
 */
export const ExamQuestionKind = {
  SINGLE_CHOICE: "SINGLE_CHOICE",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TEXT_ENTRY: "TEXT_ENTRY",
  MATCHING: "MATCHING",
} as const;
export type ExamQuestionKind =
  (typeof ExamQuestionKind)[keyof typeof ExamQuestionKind];

/** Longest list-entry label the backend stores ("viii", "B"). */
export const MAX_SET_OPTION_LABEL_LENGTH = 10;
/** Longest accepted spelling the backend stores. */
export const MAX_ACCEPTED_ANSWER_LENGTH = 200;

/** Question types a learner answers by picking from the question's own options. */
export function hasOwnOptions(questionType: string) {
  return (
    questionType === ExamQuestionKind.SINGLE_CHOICE ||
    questionType === ExamQuestionKind.MULTIPLE_CHOICE
  );
}
