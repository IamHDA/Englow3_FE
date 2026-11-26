import type { FlatQuestionItem } from "./components/blocks/QuestionPalette";

/** One part of the paper, as the part tabs and the palette list it. */
export type ExamPartEntry = {
  /** Stable for the paper: section and part position. */
  key: string;
  sectionIndex: number;
  partIndex: number;
  sectionType: string;
  title: string;
  /** Position of its first question in the paper's flat question list. */
  firstIndex: number;
  questions: FlatQuestionItem[];
};

/**
 * The paper's questions grouped by the part they belong to, in paper order. A
 * part with no question has nothing to answer and is left out, as it is from
 * the flat list.
 */
export function partsOf(
  questions: readonly FlatQuestionItem[],
): ExamPartEntry[] {
  const parts: ExamPartEntry[] = [];
  for (const question of questions) {
    const key = `${question.sectionIndex}:${question.partIndex}`;
    const last = parts.at(-1);
    if (last?.key === key) {
      last.questions.push(question);
    } else {
      parts.push({
        key,
        sectionIndex: question.sectionIndex,
        partIndex: question.partIndex,
        sectionType: question.sectionType,
        title: question.partTitle,
        firstIndex: question.globalIndex,
        questions: [question],
      });
    }
  }
  return parts;
}

/** The part a question of the flat list belongs to, by its position. */
export function partIndexOf(
  parts: readonly ExamPartEntry[],
  questionIndex: number,
): number {
  return parts.findIndex(
    (part) =>
      questionIndex >= part.firstIndex &&
      questionIndex < part.firstIndex + part.questions.length,
  );
}

/**
 * What a part is called on screen: its title, after the name of its section
 * ("Listening · Part 1") when the paper has more than one section, so the two
 * "Part 1"s of a listening and reading paper are told apart.
 */
export function partLabel(
  part: ExamPartEntry,
  parts: readonly ExamPartEntry[],
): string {
  const multiSection = parts.some(
    (other) => other.sectionIndex !== part.sectionIndex,
  );
  if (!multiSection) return part.title;
  const section =
    part.sectionType.charAt(0).toUpperCase() +
    part.sectionType.slice(1).toLowerCase();
  return `${section} · ${part.title}`;
}
