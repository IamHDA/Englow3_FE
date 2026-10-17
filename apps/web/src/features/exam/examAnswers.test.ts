import { expect, it } from "vitest";
import { isExamAnswerPresent, sanitizeExamAnswers } from "./examAnswers";

it("restores only nonempty answers belonging to the current paper and its options", () => {
  const questions = [
    { id: "q1", options: [{ id: "a" }, { id: "b" }] },
    { id: "q2", options: [{ id: "c" }] },
    { id: "q3", options: [{ id: "d" }] },
  ];
  expect(
    sanitizeExamAnswers(questions, {
      q1: ["a", "a", "old-option"],
      q2: [],
      q3: "",
      "old-question": "b",
    }),
  ).toEqual({ q1: ["a"] });
  expect(isExamAnswerPresent([])).toBe(false);
  expect(isExamAnswerPresent([""])).toBe(false);
  expect(isExamAnswerPresent("")).toBe(false);
});
