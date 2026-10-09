import { describe, expect, it } from "vitest";

import { safeNext } from "./safeNext";

describe("safeNext", () => {
  it("keeps a path on this site", () => {
    expect(safeNext("/auth/reset")).toBe("/auth/reset");
    expect(safeNext("/exams?tab=mine")).toBe("/exams?tab=mine");
  });

  it("refuses anything that leads to another site", () => {
    for (const next of [
      null,
      "",
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "evil.example",
    ])
      expect(safeNext(next)).toBe("/");
  });
});
