import { describe, expect, it } from "vitest";

import type { ExamPart } from "../../types/authoring";
import { partKey, partsWithErrors, questionCount } from "./ExamTreeEditor";

describe("folded parts in the exam editor", () => {
  it("keeps open every part that holds a validation error, once each", () => {
    expect(
      partsWithErrors({
        "content.sections[0].parts[2].title": "Required",
        "content.sections[0].parts[2].questionSets[1].questions[0].content":
          "Required",
        "content.sections[1].parts[0].questionSets[0].instruction": "Too long",
        "metadata.title": "Required",
      }),
    ).toEqual([partKey(0, 2), partKey(1, 0)]);
  });

  it("counts the questions of a part across its sets for the folded header", () => {
    const part = {
      questionSets: [{ questions: [{}, {}, {}] }, { questions: [{}] }],
    } as unknown as ExamPart;
    expect(questionCount(part)).toBe(4);
  });
});
