import { ExamQuestionType } from "@/lib/graphql/generated/schemaTypes";
import type { ExamPaper } from "./types";

/**
 * Một câu trả lời trong lúc làm bài: mã lựa chọn (chọn một, hoặc một mục trong
 * danh sách chung của câu matching), danh sách mã (câu "choose N"), hoặc chữ
 * người học gõ (câu điền từ).
 */
export type ExamAnswer = string | string[] | { text: string };
export type ExamAnswers = Record<string, ExamAnswer>;

/** Backend nhận tối đa 200 ký tự cho một câu điền từ. */
export const MAX_TEXT_ANSWER_LENGTH = 200;

/**
 * Điều một câu chấp nhận, đủ để lọc câu trả lời: các mã được chọn - với câu
 * matching là danh sách chung của nhóm câu - hoặc có phải câu gõ chữ không.
 */
export type AnswerSlot = {
  id: string;
  typed: boolean;
  options: readonly { id: string }[];
};

export function answerSlots(paper: ExamPaper | null | undefined): AnswerSlot[] {
  if (!paper) return [];
  return paper.sections.flatMap((section) =>
    section.parts.flatMap((part) =>
      part.questionSets.flatMap((set) =>
        set.questions.map((question) => ({
          id: question.id,
          typed: question.questionType === ExamQuestionType.TEXT_ENTRY,
          options:
            question.questionType === ExamQuestionType.MATCHING
              ? set.setOptions
              : question.options,
        })),
      ),
    ),
  );
}

function isTyped(answer: unknown): answer is { text: string } {
  return (
    typeof answer === "object" &&
    answer !== null &&
    !Array.isArray(answer) &&
    typeof (answer as { text?: unknown }).text === "string"
  );
}

/** Chỉ giữ câu trả lời thuộc đề này, đúng dạng của câu, và không rỗng. */
export function sanitizeExamAnswers(
  questions: readonly AnswerSlot[],
  answers: ExamAnswers,
) {
  const clean: ExamAnswers = {};
  for (const question of questions) {
    const answer = answers[question.id];
    if (question.typed) {
      if (isTyped(answer) && answer.text.trim())
        clean[question.id] = {
          text: answer.text.slice(0, MAX_TEXT_ANSWER_LENGTH),
        };
      continue;
    }
    if (answer === undefined || isTyped(answer)) continue;
    const options = new Set(question.options.map((option) => option.id));
    const selected = [
      ...new Set(
        (Array.isArray(answer) ? answer : [answer]).filter((id) =>
          options.has(id),
        ),
      ),
    ];
    if (selected.length)
      clean[question.id] = Array.isArray(answer) ? selected : selected[0];
  }
  return clean;
}

export function isExamAnswerPresent(answer: ExamAnswer | undefined) {
  if (isTyped(answer)) return answer.text.trim().length > 0;
  return Array.isArray(answer)
    ? answer.some((id) => id.length > 0)
    : Boolean(answer);
}

/** Một câu trả lời có hợp dạng lưu trong trình duyệt không. */
export function isStoredExamAnswer(answer: unknown): answer is ExamAnswer {
  return (
    typeof answer === "string" ||
    isTyped(answer) ||
    (Array.isArray(answer) && answer.every((id) => typeof id === "string"))
  );
}

/** Câu trả lời gửi lên khi lưu nháp và khi nộp bài. */
export function toAnswerInputs(answers: ExamAnswers) {
  return Object.entries(answers).map(([questionId, answer]) =>
    isTyped(answer)
      ? { questionId, selectedOptionIds: [], textAnswer: answer.text }
      : {
          questionId,
          selectedOptionIds: Array.isArray(answer) ? answer : [answer],
        },
  );
}

/** Bản nháp server trả về, đưa lại thành câu trả lời trên màn hình. */
export function fromDraftAnswers(
  answers: readonly {
    questionId: string;
    selectedOptionIds: readonly string[];
    textAnswer?: string | null;
  }[],
): ExamAnswers {
  const restored: ExamAnswers = {};
  for (const answer of answers) {
    if (answer.textAnswer)
      restored[answer.questionId] = { text: answer.textAnswer };
    else if (answer.selectedOptionIds.length)
      restored[answer.questionId] = [...answer.selectedOptionIds];
  }
  return restored;
}

/** Số câu như người học thấy: "14", hoặc "21–22" với câu chọn hai đáp án. */
export function questionNumberLabel(question: {
  numberFrom: number;
  numberTo: number;
}) {
  return question.numberTo > question.numberFrom
    ? `${question.numberFrom}–${question.numberTo}`
    : String(question.numberFrom);
}
