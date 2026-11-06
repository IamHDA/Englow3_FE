import { describe, expect, it } from "vitest";
import {
  fromDraftAnswers,
  gapTargets,
  isExamAnswerPresent,
  questionNumberLabel,
  sanitizeExamAnswers,
  toAnswerInputs,
} from "./examAnswers";

it("restores only nonempty answers belonging to the current paper and its options", () => {
  const questions = [
    { id: "q1", typed: false, options: [{ id: "a" }, { id: "b" }] },
    { id: "q2", typed: false, options: [{ id: "c" }] },
    { id: "q3", typed: false, options: [{ id: "d" }] },
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

describe("typed answers", () => {
  const questions = [
    { id: "gap", typed: true, options: [] },
    { id: "choice", typed: false, options: [{ id: "a" }] },
  ];

  it("keeps what was typed on a text question and drops it on a choice question", () => {
    expect(
      sanitizeExamAnswers(questions, {
        gap: { text: "museum" },
        choice: { text: "B" },
      }),
    ).toEqual({ gap: { text: "museum" } });
  });

  it("drops a blank typed answer and a choice sent to a text question", () => {
    expect(sanitizeExamAnswers(questions, { gap: { text: "   " } })).toEqual(
      {},
    );
    expect(sanitizeExamAnswers(questions, { gap: "a" })).toEqual({});
  });

  it("cuts a typed answer to what the backend accepts", () => {
    const long = "x".repeat(250);
    expect(sanitizeExamAnswers(questions, { gap: { text: long } })).toEqual({
      gap: { text: "x".repeat(200) },
    });
  });

  it("counts a typed answer as answered only when it has text", () => {
    expect(isExamAnswerPresent({ text: "museum" })).toBe(true);
    expect(isExamAnswerPresent({ text: " " })).toBe(false);
  });

  it("sends a typed answer with no option and a choice without text", () => {
    expect(toAnswerInputs({ gap: { text: "museum" }, choice: "a" })).toEqual([
      { questionId: "gap", selectedOptionIds: [], textAnswer: "museum" },
      { questionId: "choice", selectedOptionIds: ["a"] },
    ]);
  });

  it("brings typed and chosen answers back from a saved draft", () => {
    expect(
      fromDraftAnswers([
        { questionId: "gap", selectedOptionIds: [], textAnswer: "museum" },
        { questionId: "choice", selectedOptionIds: ["a"], textAnswer: null },
        { questionId: "skipped", selectedOptionIds: [], textAnswer: null },
      ]),
    ).toEqual({ gap: { text: "museum" }, choice: ["a"] });
  });
});

it("labels a choose-two question with both of its numbers", () => {
  expect(questionNumberLabel({ numberFrom: 14, numberTo: 14 })).toBe("14");
  expect(questionNumberLabel({ numberFrom: 21, numberTo: 22 })).toBe("21–22");
});

it("points {{n}} at the n-th question of its set whatever orderNo the editor gave it", () => {
  // The editor numbers orderNo across the whole paper: a second set starts at 11.
  const targets = gapTargets([
    { id: "q12", orderNo: 12 },
    { id: "q11", orderNo: 11 },
  ]);
  expect(targets.get(1)?.id).toBe("q11");
  expect(targets.get(2)?.id).toBe("q12");
  expect(targets.get(11)).toBeUndefined();
});
