import { describe, expect, it } from "vitest";

import { isAdminNavActive } from "./adminNav";

describe("isAdminNavActive", () => {
  it("puts an exam being edited under Exams, not Learning content", () => {
    const editing = "/admin/content/editor/EXAM/8285995a";
    expect(isAdminNavActive(editing, "/admin/exams")).toBe(true);
    expect(isAdminNavActive(editing, "/admin/content")).toBe(false);
    expect(
      isAdminNavActive("/admin/content/editor/EXAM/new", "/admin/exams"),
    ).toBe(true);
  });

  it("keeps other content in the editor under Learning content", () => {
    const quiz = "/admin/content/editor/QUIZ/42";
    expect(isAdminNavActive(quiz, "/admin/content")).toBe(true);
    expect(isAdminNavActive(quiz, "/admin/exams")).toBe(false);
  });

  it("matches whole segments, and the overview only exactly", () => {
    expect(
      isAdminNavActive("/admin/exam-score-conversions", "/admin/exams"),
    ).toBe(false);
    expect(isAdminNavActive("/admin/exams", "/admin/exams")).toBe(true);
    expect(isAdminNavActive("/admin/blog/actions", "/admin/blog")).toBe(true);
    expect(isAdminNavActive("/admin/users", "/admin", true)).toBe(false);
    expect(isAdminNavActive("/admin", "/admin", true)).toBe(true);
  });
});
