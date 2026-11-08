import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AssessmentTaskView } from "./AssessmentTaskView";
import { AssessmentAttemptView } from "./AssessmentAttemptView";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  start: vi.fn(),
  clear: vi.fn(),
}));
const sittingId = "12345678-1234-1234-1234-123456789012";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/shared/hooks/useLanguage", () => ({
  useLanguage: () => ({ isVi: false }),
}));
vi.mock("../hooks/useAssessmentText", () => ({
  useAssessmentText: () => (s: string) => s,
}));
vi.mock("@/features/auth", () => ({
  useAuth: () => ({ session: { userId: "learner" } }),
}));
vi.mock("../hooks/useAssessmentRecorder", () => ({
  useAssessmentRecorder: () => ({
    blob: null,
    recording: false,
    clientKey: { current: null },
    clear: mocks.clear,
  }),
}));
vi.mock("./AssessmentReport", () => ({ AssessmentReport: () => null }));
vi.mock("./AssessmentResultRead", () => ({ AssessmentResultRead: () => null }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAssessmentTaskDetailQuery: () => ({
    data: {
      assessmentTask: {
        id: "task",
        skill: "WRITING",
        title: "Writing",
        taskType: "TASK_1",
        instructions: "Write",
        timeLimitSeconds: 1200,
        minimumWords: 150,
      },
      assessmentCapabilities: { automaticWriting: true },
    },
  }),
  useAssessmentStartMutation: () => [mocks.start],
  useAssessmentSubmitMutation: () => [vi.fn()],
  useAssessmentRetryMutation: () => [vi.fn()],
  useAssessmentRequestReviewMutation: () => [vi.fn()],
  useAssessmentAttemptDetailQuery: () => ({
    data: {
      assessmentAttempt: {
        id: "answer",
        taskId: "task",
        skill: "WRITING",
        status: "COMPLETED",
        version: 1,
        task: { title: "Writing" },
      },
    },
    startPolling: vi.fn(),
    stopPolling: vi.fn(),
    refetch: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.start.mockResolvedValue({
    data: { startAssessment: { attempt: { id: "answer", status: "DRAFT" } } },
  });
});

it("keeps the full test context when opening a Writing draft", async () => {
  render(
    <MantineProvider>
      <AssessmentTaskView id="task" fullTestSittingId={sittingId} />
    </MantineProvider>,
  );
  expect(
    screen.getByRole("link", { name: "← Back to full test" }),
  ).toHaveAttribute("href", `/exams/full-tests/sittings/${sittingId}`);
  fireEvent.click(screen.getByRole("button", { name: "Bắt đầu viết bài" }));
  await waitFor(() =>
    expect(mocks.push).toHaveBeenCalledWith(
      `/study/assessments/attempts/answer?fullTestSitting=${sittingId}`,
    ),
  );
});

it("returns from the graded answer to the same full test instead of starting ordinary practice", () => {
  render(
    <MantineProvider>
      <AssessmentAttemptView id="answer" fullTestSittingId={sittingId} />
    </MantineProvider>,
  );
  expect(
    screen.getByRole("link", { name: "Continue full test" }),
  ).toHaveAttribute("href", `/exams/full-tests/sittings/${sittingId}`);
  expect(
    screen.queryByRole("link", { name: "Luyện thêm một lần" }),
  ).not.toBeInTheDocument();
});
