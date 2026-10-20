import { expect, it } from "vitest";
import { parseTutorStudyContext } from "./tutorStudyContext";
const a = "326c37a0-df28-4ef8-9b83-1835f8399cb0",
  b = "e005dc4d-d66e-4d48-a12d-940f6d1d7024";
it("restores an explicit complete source reference without accepting content or scores from the URL", () => {
  expect(
    parseTutorStudyContext(
      new URLSearchParams(`assessmentAttempt=${a}&correctAnswer=fake`),
    ),
  ).toEqual({ invalid: false, context: { assessmentAttemptId: a } });
  expect(
    parseTutorStudyContext(
      new URLSearchParams(`examAttempt=${a}&examQuestion=${b}`),
    ),
  ).toEqual({
    invalid: false,
    context: { examAttemptId: a, examQuestionId: b },
  });
});
it("rejects mixed, partial, duplicate and malformed references", () => {
  for (const query of [
    `quizAttempt=${a}`,
    `examQuestion=${a}`,
    `quizAttempt=${a}&quizQuestion=${b}&assessmentAttempt=${a}`,
    `assessmentAttempt=${a}&assessmentAttempt=${b}`,
    "assessmentAttempt=invalid",
  ])
    expect(parseTutorStudyContext(new URLSearchParams(query))).toEqual({
      invalid: true,
    });
});
