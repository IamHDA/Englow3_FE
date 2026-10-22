import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import type { DifficultSentenceItem } from "../../../types";
import { DictationHardSentences } from "./index";

function sentence(id: string, lessonId: string): DifficultSentenceItem {
  return {
    id,
    lessonId,
    text: `Line ${id}`,
    avgAccuracyPercent: 40,
    attemptsCount: 3,
    topic: "work" as DifficultSentenceItem["topic"],
  };
}

// Every hard line once linked to one fixed address, a lesson that does not exist,
// so "practise" always answered "lesson not found".
it("sends each hard line to the lesson it belongs to", () => {
  render(
    <MantineProvider>
      <LanguageProvider>
        <DictationHardSentences
          sentences={[sentence("s1", "lesson-a"), sentence("s2", "lesson-b")]}
        />
      </LanguageProvider>
    </MantineProvider>,
  );
  const hrefs = screen
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"));
  expect(hrefs).toEqual([
    "/study/dictation/lesson-a",
    "/study/dictation/lesson-b",
  ]);
});
