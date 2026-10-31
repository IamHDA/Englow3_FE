import { QuizQuestionType } from "@/lib/graphql/generated";
import type { QuizPaperQuery } from "@/lib/graphql/generated/documents";

import type { QuizQuestion } from "../../../types";

type PaperQuestion = QuizPaperQuery["quizPaper"]["questions"][number];

/**
 * Separator between the halves of a matching answer. Must stay in step with the
 * backend's QuizGrader.MATCHING_SEPARATOR - the two sides are grading the same
 * string, and a mismatch would mark every matching question wrong.
 */
const MATCHING_SEPARATOR = "|";

/**
 * The paper as the question blocks already expect it.
 *
 * The answer-key fields of QuizQuestion stay undefined on purpose: the server
 * does the marking now, and the paper it sends carries nothing to fill them
 * with. They remain on the type because the blocks were written against it, not
 * because anything here can supply them.
 */
export function toQuizQuestion(question: PaperQuestion): QuizQuestion {
  return {
    id: question.id,
    type: question.questionType,
    title: question.title,
    prompt: question.prompt,
    points: question.points,
    explanation: "",
    mcOptions: question.options.map((option) => ({
      id: option.id,
      label: option.label,
      text: option.content,
    })),
    beforeText: question.beforeText ?? undefined,
    afterText: question.afterText ?? undefined,
    originalSentence: question.originalSentence ?? undefined,
    rewriteKeyword: question.rewriteKeyword ?? undefined,
    rewriteWordBank: question.wordBank,
    scrambledWords: question.scrambledWords,
    // The blocks want pairs; the paper deliberately sends the two columns apart
    // so the pairing is not in the payload. Zipping them by index would put it
    // back, so the right half of each pair is the shuffled one at that index -
    // which is what the learner drags from, not an answer.
    matchingPairs: question.leftTexts.map((left, index) => ({
      id: `${question.id}-${index}`,
      left,
      right: question.rightTexts[index] ?? "",
    })),
  };
}

/**
 * Turns whatever a question block stored into the one string the backend marks.
 * What an answer even is differs per type, which is why this is a switch and
 * not a `String(value)`.
 */
export function encodeAnswer(question: PaperQuestion, answer: unknown): string {
  switch (question.questionType) {
    case QuizQuestionType.MULTIPLE_CHOICE:
      return typeof answer === "string" ? answer : "";

    case QuizQuestionType.FILL_BLANK:
      return typeof answer === "string" ? answer : "";

    case QuizQuestionType.REWRITE:
    case QuizQuestionType.REORDER:
      return Array.isArray(answer) ? answer.join(" ") : "";

    case QuizQuestionType.MATCHING: {
      if (answer === null || typeof answer !== "object") return "";
      const chosen = answer as Record<string, string>;
      // Ordered by the left column, because that is the order the backend
      // compares against. An unanswered pair stays an empty slot rather than
      // vanishing - dropping it would shorten the answer and could match a
      // shorter question.
      return question.leftTexts
        .map((left) => chosen[left] ?? "")
        .join(MATCHING_SEPARATOR);
    }

    default: {
      const unreachable: never = question.questionType;
      return unreachable;
    }
  }
}
