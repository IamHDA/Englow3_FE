import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { ExamOverview, type ExamOverviewProps } from "./index";
import {
  ExamStatus,
  ExamType,
  LearnerAttemptStatus,
  OpenAttemptChoice,
} from "@/lib/graphql/generated";

const mocks = vi.hoisted(() => ({ active: vi.fn(), paper: vi.fn() }));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useActiveExamAttemptQuery: (options: unknown) => mocks.active(options),
  useAttemptPaperQuery: (options: unknown) => mocks.paper(options),
}));
const exam: ExamOverviewProps["exam"] = {
  id: "exam",
  title: "Practice exam",
  description: "",
  examType: ExamType.MOCK,
  certificateType: null,
  certificateVariant: null,
  targetLevel: null,
  durationSeconds: 7200,
  maxRawScore: 100,
  passScore: null,
  questionCount: 20,
  status: ExamStatus.PUBLISHED,
  publishedAt: null,
  bestScorePercentage: null,
  attemptStatus: LearnerAttemptStatus.IN_PROGRESS,
};
beforeEach(() => {
  localStorage.setItem("englow3_lang", "vi");
  mocks.active.mockReturnValue({
    data: {
      activeExamAttempt: {
        id: "practice",
        timeLimitSeconds: 1800,
        expiresAt: "2099-01-01T00:00:00Z",
        parts: [{ id: "p1" }],
      },
    },
    loading: false,
  });
  mocks.paper.mockReturnValue({
    data: {
      attemptPaper: {
        sections: [
          {
            id: "s1",
            parts: [
              {
                id: "p1",
                title: "Saved Part 1",
                questionSets: [
                  {
                    id: "qs1",
                    title: "Saved question set",
                    questions: [{ id: "q1" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    loading: false,
  });
});

it("previews the saved time, parts and question sets without starting an attempt", async () => {
  const onStart = vi.fn();
  render(
    <MantineProvider>
      <ExamOverview
        exam={exam}
        outline={[
          {
            id: "s1",
            sectionType: "LISTENING",
            orderNo: 1,
            parts: [
              {
                id: "p1",
                orderNo: 1,
                title: "Current Part 1",
                questionCount: 1,
              },
            ],
          },
        ]}
        outlineLoading={false}
        outlineFailed={false}
        onRetryOutline={vi.fn()}
        starting={false}
        onStart={onStart}
      />
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Làm tiếp bài dở" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText("Thời lượng: 30 phút")).toBeInTheDocument();
  expect(within(dialog).getByText("Saved Part 1")).toBeInTheDocument();
  expect(within(dialog).getByText(/Saved question set/)).toBeInTheDocument();
  expect(onStart).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole("button", { name: "Tiếp tục" }));
  expect(onStart).toHaveBeenCalledWith(
    {
      mode: "PRACTICE",
      partIds: ["p1"],
      timeLimitMinutes: 30,
    },
    OpenAttemptChoice.RESUME,
  );
});
