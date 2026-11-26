import { describe, expect, it } from "vitest";

import type { FlatQuestionItem } from "./components/blocks/QuestionPalette";
import { partIndexOf, partLabel, partsOf } from "./examParts";

let next = 0;
function question(
  sectionIndex: number,
  partIndex: number,
  label: string,
): FlatQuestionItem {
  return {
    globalIndex: next++,
    sectionIndex,
    partIndex,
    questionSetIndex: 0,
    questionId: `q${label}`,
    sectionType: sectionIndex === 0 ? "LISTENING" : "READING",
    partTitle: `Part ${partIndex + 1}`,
    label,
  };
}

describe("partsOf", () => {
  it("groups the questions by part, in paper order, across sections", () => {
    next = 0;
    const questions = [
      question(0, 0, "1"),
      question(0, 0, "2"),
      question(0, 1, "3"),
      question(1, 0, "4"),
      question(1, 0, "5"),
    ];

    const parts = partsOf(questions);

    expect(parts.map((part) => part.key)).toEqual(["0:0", "0:1", "1:0"]);
    expect(parts.map((part) => part.firstIndex)).toEqual([0, 2, 3]);
    expect(parts.map((part) => part.questions.map((q) => q.label))).toEqual([
      ["1", "2"],
      ["3"],
      ["4", "5"],
    ]);
    expect(parts[2]).toMatchObject({
      sectionType: "READING",
      title: "Part 1",
    });
  });

  it("finds the part of a question by its position", () => {
    next = 0;
    const parts = partsOf([
      question(0, 0, "1"),
      question(0, 0, "2"),
      question(0, 1, "3"),
    ]);

    expect(partIndexOf(parts, 0)).toBe(0);
    expect(partIndexOf(parts, 1)).toBe(0);
    expect(partIndexOf(parts, 2)).toBe(1);
    expect(partIndexOf(parts, 3)).toBe(-1);
  });

  it("has no part for a paper with no question", () => {
    expect(partsOf([])).toEqual([]);
  });

  it("names a part after its section only when the paper has more than one", () => {
    next = 0;
    const twoSections = partsOf([question(0, 0, "1"), question(1, 0, "2")]);
    expect(partLabel(twoSections[0], twoSections)).toBe("Listening · Part 1");
    expect(partLabel(twoSections[1], twoSections)).toBe("Reading · Part 1");

    const oneSection = partsOf([question(0, 0, "1"), question(0, 1, "2")]);
    expect(partLabel(oneSection[1], oneSection)).toBe("Part 2");
  });
});
