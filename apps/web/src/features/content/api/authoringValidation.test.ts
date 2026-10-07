import { expect, it } from "vitest";
import { validateAuthoring } from "./authoringValidation";
import type { AuthoringDocument, Entry } from "../types/authoring";
const document = (entry: Entry): AuthoringDocument => ({
  version: 0,
  metadata: {
    title: "Vocabulary",
    category: "Practice",
    timeLimitSeconds: 600,
    passingScorePercent: 60,
  },
  content: {
    questions: [
      { title: "Question", prompt: "Build the sentence", points: 1, ...entry },
    ],
  },
});

it("rejects a word bank missing a repeated answer token", () => {
  const result = validateAuthoring(
    "QUIZ",
    document({
      questionType: "REWRITE",
      originalSentence: "It is very very good",
      correctWords: ["very", "very", "good"],
      wordBank: ["very", "good"],
    }),
    false,
  );
  expect(result["content.questions[0].wordBank"]).toMatch(/repeated/);
});

it("allows optional banks but rejects reorder tiles that add words", () => {
  const entry = { questionType: "REORDER", correctOrder: ["I", "like", "tea"] };
  expect(validateAuthoring("QUIZ", document(entry), false)).toEqual({});
  expect(
    validateAuthoring(
      "QUIZ",
      document({ ...entry, scrambledWords: ["tea", "like", "I", "too"] }),
      false,
    )["content.questions[0].scrambledWords"],
  ).toBeTruthy();
  expect(
    validateAuthoring(
      "QUIZ",
      document({ ...entry, scrambledWords: ["tea", "I", "like"] }),
      false,
    ),
  ).toEqual({});
});
