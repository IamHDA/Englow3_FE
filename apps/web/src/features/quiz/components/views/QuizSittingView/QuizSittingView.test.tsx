import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuizSittingView } from "./index";

const start = vi.fn();
const submit = vi.fn();
const reset = vi.fn();
const paper = {
  quizId: "11111111-1111-1111-1111-111111111111",
  title: "Grammar",
  timeLimitSeconds: 600,
  questions: [
    {
      id: "q1",
      questionType: "MULTIPLE_CHOICE",
      title: "Choose",
      prompt: "Choose A",
      points: 1,
      options: [{ id: "a", label: "A", content: "Answer A" }],
      wordBank: [],
      scrambledWords: [],
      leftTexts: [],
      rightTexts: [],
    },
  ],
};

vi.mock("@/lib/graphql/generated/hooks", () => ({
  useStartQuizAttemptMutation: () => [start, { loading: false }],
  useSubmitQuizAttemptMutation: () => [submit, { loading: false, reset }],
  useQuizPaperQuery: ({ skip }: { skip: boolean }) => ({
    data: skip ? undefined : { quizPaper: paper },
    loading: false,
    refetch: vi.fn(),
  }),
}));
vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: false }),
}));
vi.mock("@/shared/components/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../../blocks/MultipleChoiceQuestion", () => ({
  MultipleChoiceQuestion: ({
    selectedOptionId,
    onSelectOption,
  }: {
    selectedOptionId?: string;
    onSelectOption: (id: string) => void;
  }) => (
    <button onClick={() => onSelectOption("a")}>
      {selectedOptionId ? "Selected A" : "Choose A"}
    </button>
  ),
}));
vi.mock("../../blocks/QuizResultSummary", () => ({
  QuizResultSummary: ({ onRestart }: { onRestart: () => void }) => (
    <button onClick={onRestart}>Retake</button>
  ),
}));
vi.mock("../../blocks/QuizTimerPalette", () => ({
  QuizTimerPalette: ({
    onSubmit,
    timeRemainingSeconds,
  }: {
    onSubmit: () => void;
    timeRemainingSeconds: number;
  }) => (
    <>
      <span data-testid="time">{timeRemainingSeconds}</span>
      <button onClick={onSubmit}>Submit test</button>
    </>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  start.mockResolvedValue({
    data: {
      startQuizAttempt: {
        id: "attempt",
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
      },
    },
  });
  submit.mockResolvedValue({
    data: {
      submitQuizAttempt: {
        quizId: paper.quizId,
        quizTitle: "Grammar",
        score: 1,
        maxScore: 1,
        scorePercentage: 100,
        passed: true,
        startedAt: new Date().toISOString(),
        reviews: [],
      },
    },
  });
});

function show() {
  render(
    <MantineProvider>
      <QuizSittingView quizId={paper.quizId} />
    </MantineProvider>,
  );
}

describe("quiz attempt UX", () => {
  it("starts with the server deadline and opens a fresh attempt on retake", async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(Number(screen.getByTestId("time").textContent)).toBeGreaterThan(590);
    await user.click(screen.getByRole("button", { name: "Choose A" }));
    await user.click(screen.getByRole("button", { name: "Submit test" }));
    await user.click(await screen.findByRole("button", { name: "Retake" }));
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(start).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole("button", { name: "Choose A" }),
    ).toBeInTheDocument();
  });

  it("keeps selected answers when submission fails and permits retry", async () => {
    submit.mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();
    show();
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.click(screen.getByRole("button", { name: "Choose A" }));
    await user.click(screen.getByRole("button", { name: "Submit test" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Submission failed",
    );
    expect(
      screen.getByRole("button", { name: "Selected A" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit test" }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
    expect(submit.mock.calls[1][0].variables.answers).toEqual([
      { questionId: "q1", response: "a" },
    ]);
  });
});
