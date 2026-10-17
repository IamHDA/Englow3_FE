import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { DictationHistoryTable } from "./index";
import type { DictationHistoryItem } from "../../../types";

it("opens the lesson belonging to each history row", () => {
  const history: DictationHistoryItem[] = ["lesson-a", "lesson-b"].map(
    (lessonId) => ({
      id: "2026-10-17-" + lessonId,
      lessonId,
      lessonTitle: lessonId,
      date: "17/10/2026",
      sentenceCountLabel: "3",
      accuracyLabel: "90%",
      studyTimeLabel: "5m",
      hintsUsedLabel: "—",
    }),
  );
  render(
    <MantineProvider>
      <DictationHistoryTable history={history} />
    </MantineProvider>,
  );
  const links = screen.getAllByRole("link");
  expect(links.map((link) => link.getAttribute("href"))).toEqual([
    "/study/dictation/lesson-a",
    "/study/dictation/lesson-b",
  ]);
});
