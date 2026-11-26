import {
  ExamQuestionType,
  type AttemptPaperQuery,
  type SubmitAnswerInput,
} from "@/lib/graphql/generated";

export type Paper = AttemptPaperQuery["attemptPaper"];
export type PaperSection = Paper["sections"][number];
export type PaperPart = PaperSection["parts"][number];
export type PaperSet = PaperPart["questionSets"][number];
export type PaperQuestion = PaperSet["questions"][number];

/** One option id, several (multi-select), or typed text. */
export type ExamAnswer = string | string[] | { text: string };
export type ExamAnswers = Record<string, ExamAnswer>;

/** The backend caps typed answers at 200 characters. */
export const MAX_TEXT_ANSWER_LENGTH = 200;

export function isTyped(
  answer: ExamAnswer | undefined,
): answer is { text: string } {
  return (
    typeof answer === "object" && answer !== null && !Array.isArray(answer)
  );
}

/** Every question of a paper in reading order, each with the set it belongs to. */
export function flattenPaper(paper: Paper) {
  const out: {
    section: PaperSection;
    part: PaperPart;
    set: PaperSet;
    question: PaperQuestion;
  }[] = [];
  for (const section of [...paper.sections].sort(
    (a, b) => a.orderNo - b.orderNo,
  )) {
    for (const part of [...section.parts].sort(
      (a, b) => a.orderNo - b.orderNo,
    )) {
      for (const set of [...part.questionSets].sort(
        (a, b) => a.orderNo - b.orderNo,
      )) {
        for (const question of [...set.questions].sort(
          (a, b) => a.orderNo - b.orderNo,
        )) {
          out.push({ section, part, set, question });
        }
      }
    }
  }
  return out;
}

/** The ids a question's answer may name: its own options, or for matching the set's shared list. */
export function choiceIds(question: PaperQuestion, set: PaperSet): Set<string> {
  return new Set(
    question.questionType === ExamQuestionType.MATCHING
      ? set.setOptions.map((option) => option.id)
      : question.options.map((option) => option.id),
  );
}

/**
 * What goes to the backend: one entry per question, skipped ones included with
 * nothing selected. Ids that are not the question's own are dropped, and
 * typed answers are trimmed and capped - a stale or tampered draft can never
 * send something the backend would refuse. Mirrors the web's sanitizeExamAnswers.
 */
export function toSubmitInput(
  paper: Paper,
  answers: ExamAnswers,
): SubmitAnswerInput[] {
  return flattenPaper(paper).map(({ question, set }) => {
    const answer = answers[question.id];
    if (question.questionType === ExamQuestionType.TEXT_ENTRY) {
      const text = isTyped(answer)
        ? answer.text.trim().slice(0, MAX_TEXT_ANSWER_LENGTH)
        : "";
      return {
        questionId: question.id,
        selectedOptionIds: [],
        ...(text ? { textAnswer: text } : {}),
      };
    }
    const allowed = choiceIds(question, set);
    const picked =
      answer === undefined || isTyped(answer)
        ? []
        : Array.isArray(answer)
          ? answer
          : [answer];
    return {
      questionId: question.id,
      selectedOptionIds: [...new Set(picked.filter((id) => allowed.has(id)))],
    };
  });
}

/** A saved draft back into the screen's shape. */
export function fromDraft(
  draft: {
    questionId: string;
    selectedOptionIds: string[];
    textAnswer?: string | null;
  }[],
  paper: Paper,
): ExamAnswers {
  const byId = new Map(
    flattenPaper(paper).map((entry) => [entry.question.id, entry.question]),
  );
  const answers: ExamAnswers = {};
  for (const entry of draft) {
    const question = byId.get(entry.questionId);
    if (!question) continue;
    if (question.questionType === ExamQuestionType.TEXT_ENTRY) {
      if (entry.textAnswer)
        answers[entry.questionId] = { text: entry.textAnswer };
    } else if (question.questionType === ExamQuestionType.MULTIPLE_CHOICE) {
      if (entry.selectedOptionIds.length)
        answers[entry.questionId] = entry.selectedOptionIds;
    } else if (entry.selectedOptionIds[0]) {
      answers[entry.questionId] = entry.selectedOptionIds[0];
    }
  }
  return answers;
}

export function isAnswered(answer: ExamAnswer | undefined): boolean {
  if (answer === undefined) return false;
  if (isTyped(answer)) return answer.text.trim().length > 0;
  return Array.isArray(answer) ? answer.length > 0 : answer.length > 0;
}

export function questionNumberLabel(question: {
  numberFrom: number;
  numberTo: number;
}) {
  return question.numberTo > question.numberFrom
    ? `${question.numberFrom}–${question.numberTo}`
    : String(question.numberFrom);
}
