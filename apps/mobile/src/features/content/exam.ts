import { ExamQuestionKind, hasOwnOptions } from "./examQuestionTypes";
import type { ExamPart, ExamQuestion, ExamSection, ExamSet } from "./types";

/** The exam tree's building blocks and rules, as the web's ExamTreeEditor keeps them. */
export const blankSet = (): ExamSet => ({
  title: "",
  content: "",
  instruction: "",
  orderNo: 1,
  questions: [],
});

export const blankPart = (): ExamPart => ({
  title: "",
  content: "",
  instruction: "",
  orderNo: 1,
  questionSets: [blankSet()],
});

export const blankQuestion = (skill: string): ExamQuestion => ({
  content: "",
  questionType: "SINGLE_CHOICE",
  difficultyLevel: "MEDIUM",
  skillType: skill,
  orderNo: 1,
  maxRawScore: 1,
  explanation: "",
  options: [
    { label: "A", content: "", correct: false, orderNo: 1 },
    { label: "B", content: "", correct: false, orderNo: 2 },
  ],
});

const blankOptions = () => blankQuestion("").options;

/**
 * Switch how a question is answered, dropping what the new type cannot hold -
 * the backend refuses options on a gap or a matching question, and accepted
 * spellings or list labels on anything else.
 */
export function changeQuestionType(
  question: ExamQuestion,
  questionType: string,
): ExamQuestion {
  const own = hasOwnOptions(questionType);
  return {
    ...question,
    questionType,
    options: own
      ? question.options.length
        ? question.options
        : blankOptions()
      : [],
    acceptedAnswers:
      questionType === ExamQuestionKind.TEXT_ENTRY
        ? question.acceptedAnswers?.length
          ? question.acceptedAnswers
          : [{ text: "", caseSensitive: false, orderNo: 1 }]
        : [],
    matchingLabels:
      questionType === ExamQuestionKind.MATCHING
        ? (question.matchingLabels ?? [])
        : [],
  };
}

/** Sections a mock exam cannot score. */
export function isProductive(sectionType: string): boolean {
  return sectionType === "WRITING" || sectionType === "SPEAKING";
}

/** Renumbers every level and totals each section's points from its questions. */
export function normalizeExam(sections: ExamSection[]): ExamSection[] {
  let questionOrder = 1;
  return sections.map((section, si) => {
    const parts = section.parts.map((part, pi) => ({
      ...part,
      orderNo: pi + 1,
      questionSets: part.questionSets.map((set, qi) => ({
        ...set,
        orderNo: qi + 1,
        questions: set.questions.map((question) => ({
          ...question,
          orderNo: questionOrder++,
          options: question.options.map((option, oi) => ({
            ...option,
            orderNo: oi + 1,
          })),
        })),
      })),
    }));
    return {
      ...section,
      orderNo: si + 1,
      maxRawScore: parts.reduce(
        (n, part) =>
          n +
          part.questionSets.reduce(
            (m, set) =>
              m + set.questions.reduce((k, q) => k + q.maxRawScore, 0),
            0,
          ),
        0,
      ),
      parts,
    };
  });
}

export const newSection = (sections: ExamSection[]): ExamSection => ({
  sectionType: sections.some((s) => s.sectionType === "READING")
    ? "LISTENING"
    : "READING",
  orderNo: sections.length + 1,
  maxRawScore: 0,
  scoredByCriteria: false,
  parts: [blankPart()],
});
