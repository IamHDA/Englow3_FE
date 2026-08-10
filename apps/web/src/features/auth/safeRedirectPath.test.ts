import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./safeRedirectPath";

describe("safeRedirectPath", () => {
  it("keeps an ordinary in-app path", () => {
    expect(safeRedirectPath("/study/flashcards")).toBe("/study/flashcards");
    expect(safeRedirectPath("/exams?page=2")).toBe("/exams?page=2");
  });

  it("falls back home when there is nothing to go to", () => {
    expect(safeRedirectPath(null)).toBe("/");
    expect(safeRedirectPath(undefined)).toBe("/");
    expect(safeRedirectPath("")).toBe("/");
  });

  it("refuses to leave the app", () => {
    for (const hostile of [
      "https://evil.example.com",
      "//evil.example.com",
      "http://evil.example.com/path",
      "\\\\evil.example.com",
      "/\\evil.example.com",
      "javascript:alert(1)",
    ]) {
      expect(safeRedirectPath(hostile)).toBe("/");
    }
  });
});
