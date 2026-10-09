import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PracticeAttempt } from "../types";
import { parseReport } from "../types";
import { AssessmentReport } from "./AssessmentReport";

const criteria = [
  "TASK_RESPONSE",
  "COHERENCE_COHESION",
  "LEXICAL_RESOURCE",
  "GRAMMATICAL_RANGE",
];

const full = JSON.stringify({
  overall: 6.5,
  criteria: criteria.map((key, i) => ({
    key,
    score: 7 - i * 0.5,
    feedback: `Nhận xét ${key}`,
  })),
  summary: "Bài viết rõ ý",
  strengths: ["Lập trường rõ"],
  improvements: ["Đa dạng từ nối"],
  estimated: true,
});

// What the server sends a learner: no per-criterion score, a named weakest criterion.
const hidden = JSON.stringify({
  ...JSON.parse(full),
  criteria: JSON.parse(full).criteria.map((criterion: { score?: number }) => {
    const copy = { ...criterion };
    delete copy.score;
    return copy;
  }),
  scoresHidden: true,
  focusCriterion: "GRAMMATICAL_RANGE",
});

function renderReport(report: string) {
  const attempt = {
    id: "a",
    skill: "WRITING",
    status: "COMPLETED",
    source: "AI",
    report,
    answerText: "",
    task: { title: "Essay", instructions: "Discuss", sampleAnswer: null },
  } as unknown as PracticeAttempt;
  return render(
    <MantineProvider>
      <AssessmentReport attempt={attempt} />
    </MantineProvider>,
  );
}

describe("parseReport", () => {
  it("reads a learner's report that has no criterion scores", () => {
    expect(parseReport(hidden)?.focusCriterion).toBe("GRAMMATICAL_RANGE");
  });

  it("still rejects a report that lost its scores without saying so", () => {
    const stripped = JSON.parse(hidden);
    delete stripped.scoresHidden;
    expect(parseReport(JSON.stringify(stripped))).toBeNull();
  });
});

describe("AssessmentReport", () => {
  it("shows the overall score and the feedback but no criterion bands to a learner", () => {
    renderReport(hidden);
    expect(screen.getByText("6.5 / 9")).toBeTruthy();
    expect(screen.getByText("Nhận xét TASK_RESPONSE")).toBeTruthy();
    expect(screen.getByText("Điểm làm tốt")).toBeTruthy();
    expect(screen.getByText("Bước cải thiện tiếp theo")).toBeTruthy();
    expect(screen.getByText("Nhận xét chi tiết theo tiêu chí")).toBeTruthy();
    // 7.0, 6.5, 6.0 and 5.5 are what the criterion badges would have said.
    for (const band of ["7.0", "6.0", "5.5"])
      expect(screen.queryByText(band)).toBeNull();
    expect(screen.getAllByText("Ngữ pháp").length).toBeGreaterThan(0);
  });

  it("keeps the criterion bands for staff, whose copy carries them", () => {
    renderReport(full);
    expect(screen.getByText("7.0")).toBeTruthy();
    expect(screen.getByText("5.5")).toBeTruthy();
    expect(screen.queryByText("Nhận xét chi tiết theo tiêu chí")).toBeNull();
  });
});
