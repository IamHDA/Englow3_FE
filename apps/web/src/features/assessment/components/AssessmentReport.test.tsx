import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

function renderReport(
  report: string,
  options: {
    withContext?: boolean;
    answerText?: string;
    sampleAnswer?: string;
    skill?: "WRITING" | "SPEAKING";
    audioUrl?: string;
    recognizedText?: string;
  } = {},
) {
  const attempt = {
    id: "a",
    skill: options.skill ?? "WRITING",
    status: "COMPLETED",
    source: "AI",
    report,
    answerText: options.answerText ?? "",
    audioUrl: options.audioUrl ?? null,
    recognizedText: options.recognizedText ?? null,
    task: {
      title: "Essay",
      instructions: "Discuss",
      sampleAnswer: options.sampleAnswer ?? null,
    },
  } as unknown as PracticeAttempt;
  return render(
    <MantineProvider>
      <AssessmentReport attempt={attempt} withContext={options.withContext} />
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
    expect(screen.getByText("6.5")).toBeTruthy();
    // The weakest criterion is open to start with; another one is a click away.
    expect(screen.getByText("Nhận xét GRAMMATICAL_RANGE")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Đáp ứng yêu cầu đề/ }));
    expect(screen.getByText("Nhận xét TASK_RESPONSE")).toBeTruthy();
    expect(screen.getByText("Điểm làm tốt")).toBeTruthy();
    expect(screen.getByText("Bước cải thiện tiếp theo")).toBeTruthy();
    // 7.0, 6.5, 6.0 and 5.5 are what the criterion badges would have said.
    for (const band of ["7.0", "6.0", "5.5"])
      expect(screen.queryByText(band)).toBeNull();
    expect(screen.getAllByText("Ngữ pháp").length).toBeGreaterThan(0);
  });

  it("keeps the criterion bands for staff, whose copy carries them", () => {
    renderReport(full);
    expect(screen.getByText("7.0")).toBeTruthy();
    expect(screen.getByText("5.5")).toBeTruthy();
  });

  it("puts the task and the learner's response as panels only when asked for", () => {
    const { unmount } = renderReport(full);
    expect(screen.queryByText("Đề bài")).toBeNull();
    unmount();
    renderReport(full, { withContext: true, answerText: "My essay" });
    expect(screen.getByText("Đề bài")).toBeTruthy();
    expect(screen.getByText("Bài viết")).toBeTruthy();
  });

  it("offers the reference answer as a panel when the task has one", () => {
    renderReport(full, { sampleAnswer: "A model answer" });
    expect(screen.getByText("Bài tham khảo")).toBeTruthy();
  });

  it("switches among all four result sections and only exposes the selected content", () => {
    renderReport(hidden, {
      withContext: true,
      skill: "SPEAKING",
      audioUrl: "http://localhost:9000/test.wav",
      recognizedText: "My recorded answer",
      sampleAnswer: "A reference response",
    });
    const navigation = screen.getByRole("tablist", {
      name: "Nội dung kết quả",
    });
    expect(within(navigation).getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tabpanel", { name: "Nhận xét" })).toBeVisible();
    fireEvent.click(within(navigation).getByRole("tab", { name: "Bài nói" }));
    const answer = screen.getByRole("tabpanel", { name: "Bài nói" });
    expect(within(answer).getByText("My recorded answer")).toBeVisible();
    expect(answer.querySelector("audio")).toHaveAttribute(
      "src",
      "http://localhost:9000/test.wav",
    );
    expect(
      screen.queryByText("Nhận xét GRAMMATICAL_RANGE"),
    ).not.toBeInTheDocument();
    fireEvent.click(within(navigation).getByRole("tab", { name: "Đề bài" }));
    expect(
      within(screen.getByRole("tabpanel", { name: "Đề bài" })).getByText(
        "Discuss",
      ),
    ).toBeVisible();
    expect(document.querySelector("audio")).toBeNull();
    fireEvent.click(
      within(navigation).getByRole("tab", { name: "Bài tham khảo" }),
    );
    expect(
      within(screen.getByRole("tabpanel", { name: "Bài tham khảo" })).getByText(
        "A reference response",
      ),
    ).toBeVisible();
    fireEvent.click(within(navigation).getByRole("tab", { name: "Nhận xét" }));
    expect(screen.getByText("Nhận xét GRAMMATICAL_RANGE")).toBeVisible();
    expect(screen.queryByText("A reference response")).not.toBeInTheDocument();
  });

  it("supports moving between result sections with the keyboard", async () => {
    const user = userEvent.setup();
    renderReport(hidden, {
      withContext: true,
      answerText: "My writing",
      sampleAnswer: "Model writing",
    });
    screen.getByRole("tab", { name: "Nhận xét" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Bài viết" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Bài viết" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel", { name: "Bài viết" })).toBeVisible();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Bài tham khảo" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("tabpanel", { name: "Bài tham khảo" }),
    ).toBeVisible();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Nhận xét" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tabpanel", { name: "Nhận xét" })).toBeVisible();
  });
});
