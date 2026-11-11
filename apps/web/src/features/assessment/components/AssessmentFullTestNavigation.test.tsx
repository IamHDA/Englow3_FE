import { MantineProvider } from "@mantine/core";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AssessmentTaskView } from "./AssessmentTaskView";
import { AssessmentAttemptView } from "./AssessmentAttemptView";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  start: vi.fn(),
  startFull: vi.fn(),
  audioStart: vi.fn(),
  recordingPolicy: vi.fn(),
  skill: "WRITING",
  taskType: "TASK_1",
  blob: null as Blob | null,
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
  useAssessmentRecorder: (...args: unknown[]) => {
    mocks.recordingPolicy(...args);
    return {
      blob: mocks.blob,
      start: mocks.audioStart,
      recording: false,
      clientKey: { current: null },
      clear: mocks.clear,
    };
  },
}));
vi.mock("./AssessmentReport", () => ({ AssessmentReport: () => null }));
vi.mock("./AssessmentResultRead", () => ({ AssessmentResultRead: () => null }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAssessmentTaskDetailQuery: () => ({
    data: {
      assessmentTask: {
        id: "task",
        skill: mocks.skill,
        title: "Writing",
        taskType: mocks.taskType,
        instructions: "Write",
        timeLimitSeconds: 1200,
        minimumWords: 150,
      },
      assessmentCapabilities: {
        automaticWriting: true,
        automaticSpeaking: true,
      },
    },
  }),
  useAssessmentStartMutation: () => [mocks.start],
  useStartFullTestAssessmentMutation: () => [mocks.startFull],
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
  mocks.skill = "WRITING";
  mocks.taskType = "TASK_1";
  mocks.blob = null;
  mocks.start.mockResolvedValue({
    data: { startAssessment: { attempt: { id: "answer", status: "DRAFT" } } },
  });
  mocks.startFull.mockResolvedValue({
    data: { startFullTestAssessment: { attemptId: "answer", uploadUrl: null } },
  });
});
afterEach(() => vi.useRealTimers());

it("gives full-test Speaking Part 2 a preparation minute and a two-minute recorder", () => {
  vi.useFakeTimers();
  mocks.skill = "SPEAKING";
  mocks.taskType = "PART_2";
  const view = render(
    <MantineProvider>
      <AssessmentTaskView id="task" fullTestSittingId={sittingId} />
    </MantineProvider>,
  );
  expect(mocks.recordingPolicy).toHaveBeenLastCalledWith(
    `learner:task:${sittingId}`,
    120,
  );
  fireEvent.click(screen.getByRole("button", { name: "Prepare for 1 minute" }));
  expect(screen.getByRole("timer")).toHaveTextContent("60s");
  expect(mocks.audioStart).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(60000));
  fireEvent.click(screen.getByRole("button", { name: "Bắt đầu ghi âm" }));
  expect(mocks.audioStart).toHaveBeenCalledOnce();
  mocks.blob = new Blob(["audio"]);
  view.rerender(
    <MantineProvider>
      <AssessmentTaskView id="task" fullTestSittingId={sittingId} />
    </MantineProvider>,
  );
  expect(screen.getByRole("button", { name: "Ghi lại" })).toBeDisabled();
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
    expect(mocks.startFull).toHaveBeenCalledWith({
      variables: { sittingId, taskId: "task", slot: "WRITING_TASK_1" },
    }),
  );
  expect(mocks.start).not.toHaveBeenCalled();
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
