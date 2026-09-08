import { describe, expect, it } from "vitest";
import { computeWordDiff } from "./diff";

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
    expect(res.items.some((it) => it.type === "bad" && it.text === "go")).toBe(true);
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
