import { expect, it } from "vitest";
import {
  readFullTestSitting,
  withFullTestSitting,
  fullTestSittingPath,
} from "./fullTestNavigation";

it("preserves the same sitting through a task and its submitted answer", () => {
  const sitting = "12345678-1234-1234-1234-123456789012";
  const task = withFullTestSitting("/study/writing/task", sitting);
  expect(
    readFullTestSitting(
      new URL(task, "https://example.test").searchParams.get(
        "fullTestSitting",
      ) ?? undefined,
    ),
  ).toBe(sitting);
  const answer = withFullTestSitting(
    "/study/assessments/attempts/answer",
    sitting,
  );
  expect(answer).toContain(`fullTestSitting=${sitting}`);
  expect(fullTestSittingPath(sitting)).toBe(
    `/exams/full-tests/sittings/${sitting}`,
  );
});

it("keeps ordinary practice unchanged and ignores malformed return context", () => {
  expect(withFullTestSitting("/study/writing/task", null)).toBe(
    "/study/writing/task",
  );
  expect(readFullTestSitting("https://untrusted.test")).toBeNull();
  expect(readFullTestSitting(["one", "two"])).toBeNull();
});
