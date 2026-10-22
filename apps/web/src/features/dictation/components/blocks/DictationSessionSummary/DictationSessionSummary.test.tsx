import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import type { DictationSessionSummaryData } from "../../../types";
import { DictationSessionSummary } from "./index";

const summary: DictationSessionSummaryData = {
  lessonTitle: "A day at work",
  lessonLevel: "A2",
  overallAccuracyPercent: 70,
  wordsCorrectRatio: "7 / 10",
  sentencesCompletedCount: 2,
  studyDurationFormatted: "1m 10s",
  metrics: { replays: 1, perfectSentences: 0, sentencesWithMistakes: 2 },
  breakdown: { correctPercent: 70, incorrectPercent: 20, missingPercent: 10 },
  mistakes: [
    {
      id: "s3",
      sentenceNumber: 3,
      accuracyPercent: 50,
      learnerAnswer: "I go office",
      correctAnswer: "I go to the office",
    },
    {
      id: "s4",
      sentenceNumber: 4,
      accuracyPercent: 0,
      learnerAnswer: "",
      correctAnswer: "See you soon",
    },
  ],
};

function renderSummary(language: "vi" | "en") {
  localStorage.setItem("englow3_lang", language);
  render(
    <MantineProvider>
      <LanguageProvider>
        <DictationSessionSummary
          summary={summary}
          onRestart={vi.fn()}
          onReviewMistakes={vi.fn()}
        />
      </LanguageProvider>
    </MantineProvider>,
  );
}

// The sentence label was always English and the skipped marker always
// Vietnamese, whichever language the learner had chosen.
beforeEach(() => localStorage.clear());

it("labels the mistakes in Vietnamese", () => {
  renderSummary("vi");
  expect(screen.getByText("Câu 3")).toBeTruthy();
  expect(screen.getByText("(Bỏ qua)")).toBeTruthy();
  expect(screen.queryByText(/Sentence \d/)).toBeNull();
});

it("labels the mistakes in English", () => {
  renderSummary("en");
  expect(screen.getByText("Sentence 3")).toBeTruthy();
  expect(screen.getByText("(Skipped)")).toBeTruthy();
  expect(screen.queryByText("(Bỏ qua)")).toBeNull();
});
