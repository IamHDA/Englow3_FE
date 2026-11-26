import { QuizQuestionType, type QuizPaperQuery } from "@/lib/graphql/generated";

export type PaperQuestion = QuizPaperQuery["quizPaper"]["questions"][number];

/** What the learner has chosen, per question type. */
export type QuizAnswer = string | string[] | Record<string, string> | undefined;

const MATCHING_SEPARATOR = "|";

/**
 * The wire format the backend grades, identical to the web's
 * (apps/web/src/features/quiz/components/views/QuizSittingView/answerEncoding.ts):
 * an option id, the typed phrase, the chosen words joined by spaces, or the
 * right-hand halves in left-column order joined by "|".
 */
export function encodeAnswer(
  question: PaperQuestion,
  answer: QuizAnswer,
): string {
  switch (question.questionType) {
    case QuizQuestionType.MULTIPLE_CHOICE:
    case QuizQuestionType.FILL_BLANK:
      return typeof answer === "string" ? answer : "";
    case QuizQuestionType.REWRITE:
    case QuizQuestionType.REORDER:
      return Array.isArray(answer) ? answer.join(" ") : "";
    case QuizQuestionType.MATCHING: {
      if (
        answer === null ||
        typeof answer !== "object" ||
        Array.isArray(answer)
      )
        return "";
      // An unanswered pair stays an empty slot: dropping it would shorten the
      // answer and could match a shorter question.
      return question.leftTexts
        .map((left) => answer[left] ?? "")
        .join(MATCHING_SEPARATOR);
    }
    default: {
      const unreachable: never = question.questionType;
      return unreachable;
    }
  }
}

export function isAnswered(
  question: PaperQuestion,
  answer: QuizAnswer,
): boolean {
  if (question.questionType === QuizQuestionType.MATCHING) {
    return (
      typeof answer === "object" &&
      answer !== null &&
      !Array.isArray(answer) &&
      question.leftTexts.every((left) => Boolean(answer[left]))
    );
  }
  return encodeAnswer(question, answer).trim().length > 0;
}
