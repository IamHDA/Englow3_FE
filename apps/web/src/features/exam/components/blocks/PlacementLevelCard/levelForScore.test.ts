import { describe, expect, it } from "vitest";

import { levelForScore } from "./index";

/** The floors must match PlacementRecorderImpl in the backend. */
describe("levelForScore", () => {
  it.each([
    [100, "C2"],
    [90, "C2"],
    [89.9, "C1"],
    [75, "C1"],
    [60, "B2"],
    [45, "B1"],
    [44.9, "A2"],
    [25, "A2"],
    [24.9, "A1"],
    [0, "A1"],
  ])("puts %s%% at %s", (percentage, level) => {
    expect(levelForScore(percentage)).toBe(level);
  });
});
