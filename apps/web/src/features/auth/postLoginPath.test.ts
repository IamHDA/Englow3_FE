import { expect, it } from "vitest";
import { postLoginPath } from "./postLoginPath";
it("restores the bookmarked path including the query", () => {
  expect(
    postLoginPath("LEARNER", "?next=%2Fexams%2Fone%3FfullTestSitting%3Done"),
  ).toBe("/exams/one?fullTestSitting=one");
});
it.each([
  "https://evil.example",
  "//evil.example",
  "/\\evil.example",
  "/auth/login?next=/auth/login",
  "/api/auth/logout",
  "/\n/evil.example",
])("rejects unsafe or looping destination %s", (path) => {
  expect(postLoginPath("STAFF", "?next=" + encodeURIComponent(path))).toBe(
    "/admin",
  );
});
