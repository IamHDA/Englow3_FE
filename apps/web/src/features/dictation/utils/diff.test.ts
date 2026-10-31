import { describe, expect, it } from "vitest";
import { computeProgressiveFeedback, computeWordDiff } from "./diff";

describe("computeWordDiff", () => {
  it("returns 100% accuracy on exact match ignoring punctuation and case", () => {
    const expected = "I went to the supermarket yesterday.";
    const actual = "i went to the supermarket yesterday";
    const res = computeWordDiff(expected, actual);

    expect(res.accuracyPercent).toBe(100);
    expect(res.correctWordsCount).toBe(6);
    expect(res.mistakesCount).toBe(0);
    expect(res.items.every((it) => it.type === "ok")).toBe(true);
  });

  it("detects incorrect words and missing words accurately", () => {
    const expected = "I went to the supermarket yesterday.";
    const actual = "I go to supermarket yesterday.";
    const res = computeWordDiff(expected, actual);

    expect(res.accuracyPercent).toBeLessThan(100);
    expect(res.items.some((it) => it.type === "bad" && it.text === "go")).toBe(
      true,
    );
    expect(res.items.some((it) => it.type === "missing")).toBe(true);
    expect(res.fixes.length).toBeGreaterThan(0);
  });

  it("handles empty user input gracefully", () => {
    const expected = "Good morning.";
    const actual = "";
    const res = computeWordDiff(expected, actual);

    expect(res.accuracyPercent).toBe(0);
    expect(res.correctWordsCount).toBe(0);
    expect(res.items.length).toBe(2);
    expect(res.items.every((it) => it.type === "missing")).toBe(true);
  });
});

describe("computeWordDiff word definition", () => {
  it("ignores punctuation of every kind and a lone dash, like the backend scorer", () => {
    const diff = computeWordDiff(
      "Well - it’s [fine], isn’t it?",
      "well its fine isnt it",
    );
    expect(diff.mistakesCount).toBe(0);
    expect(diff.accuracyPercent).toBe(100);
  });
});

describe("computeProgressiveFeedback", () => {
  it("reveals only the next word and masks the remainder", () => {
    const feedback = computeProgressiveFeedback(
      "Today is November 26th.",
      "Today",
    );

    expect(feedback.correct).toBe(false);
    expect(feedback.words).toEqual([
      { text: "Today", state: "correct" },
      { text: "is", state: "hint" },
      { text: "********", state: "masked" },
      { text: "*****", state: "masked" },
    ]);
  });

  it("shows the full sentence only when it is correct", () => {
    const feedback = computeProgressiveFeedback(
      "Today is November 26th.",
      "today is november 26th",
    );

    expect(feedback.correct).toBe(true);
    expect(feedback.words.every((word) => word.state === "correct")).toBe(true);
  });
});
